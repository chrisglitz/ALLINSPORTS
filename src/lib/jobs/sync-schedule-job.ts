/**
 * Sync Schedule Job
 * Fetches and updates game schedule data
 */

import { Job, JobConfig, JobResult, JobType } from './types';
import { getAdapterRegistry } from '../adapters/factory';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SyncScheduleJob implements Job {
  config: JobConfig = {
    type: JobType.SYNC_SCHEDULE,
    name: 'Sync Schedule',
    description: 'Fetch and update NFL game schedule',
    schedule: '0 3 * * *', // Daily at 3:00 AM ET
    timeout: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  };

  async execute(): Promise<JobResult> {
    const startTime = Date.now();

    try {
      const adapters = getAdapterRegistry();
      const currentSeason = new Date().getFullYear();

      // Fetch next 2 weeks of games
      const { data: games, metadata } = await adapters.schedule.fetch({
        season: currentSeason,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });

      let upsertedCount = 0;

      for (const game of games) {
        // Upsert league
        const league = await prisma.league.upsert({
          where: {
            slug: 'nfl',
          },
          create: {
            slug: 'nfl',
            name: 'National Football League',
            season: currentSeason,
            sport: {
              connectOrCreate: {
                where: { slug: 'nfl' },
                create: { name: 'NFL', slug: 'nfl' },
              },
            },
          },
          update: {},
        });

        // Upsert venue
        let venueId: string | undefined;
        if (game.venue) {
          const venue = await prisma.venue.upsert({
            where: {
              slug: game.venue.name.toLowerCase().replace(/\s+/g, '-'),
            },
            create: {
              name: game.venue.name,
              slug: game.venue.name.toLowerCase().replace(/\s+/g, '-'),
              city: game.venue.city,
              state: game.venue.state,
              isDome: game.venue.isDome,
            },
            update: {},
          });
          venueId = venue.id;
        }

        // Upsert home team
        const homeTeam = await prisma.team.upsert({
          where: {
            leagueId_slug: {
              leagueId: league.id,
              slug: game.homeTeam.abbreviation.toLowerCase(),
            },
          },
          create: {
            leagueId: league.id,
            name: game.homeTeam.name,
            abbreviation: game.homeTeam.abbreviation,
            slug: game.homeTeam.abbreviation.toLowerCase(),
            city: game.venue?.city || '',
            venueId,
          },
          update: {},
        });

        // Upsert away team
        const awayTeam = await prisma.team.upsert({
          where: {
            leagueId_slug: {
              leagueId: league.id,
              slug: game.awayTeam.abbreviation.toLowerCase(),
            },
          },
          create: {
            leagueId: league.id,
            name: game.awayTeam.name,
            abbreviation: game.awayTeam.abbreviation,
            slug: game.awayTeam.abbreviation.toLowerCase(),
            city: '',
          },
          update: {},
        });

        // Upsert game
        await prisma.game.upsert({
          where: {
            leagueId_homeTeamId_awayTeamId_scheduledTime: {
              leagueId: league.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              scheduledTime: game.scheduledTime,
            },
          },
          create: {
            leagueId: league.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            venueId,
            scheduledTime: game.scheduledTime,
            week: game.week,
            seasonType: game.seasonType,
            status: game.status,
            homeScore: game.homeScore,
            awayScore: game.awayScore,
            dataSource: metadata.source,
            dataFetchedAt: metadata.fetchedAt,
          },
          update: {
            status: game.status,
            homeScore: game.homeScore,
            awayScore: game.awayScore,
            dataSource: metadata.source,
            dataFetchedAt: metadata.fetchedAt,
          },
        });

        upsertedCount++;
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `Synced ${upsertedCount} games`,
        duration,
        itemsProcessed: upsertedCount,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        errors: [error instanceof Error ? error.stack || error.message : 'Unknown error'],
      };
    }
  }
}
