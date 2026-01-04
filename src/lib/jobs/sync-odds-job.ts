/**
 * Sync Odds Job
 * Fetches and stores betting odds snapshots
 */

import { Job, JobConfig, JobResult, JobType } from './types';
import { getAdapterRegistry } from '../adapters/factory';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SyncOddsJob implements Job {
  config: JobConfig = {
    type: JobType.SYNC_ODDS,
    name: 'Sync Odds',
    description: 'Fetch and store betting odds',
    schedule: '*/15 * * * *', // Every 15 minutes
    timeout: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  };

  async execute(): Promise<JobResult> {
    const startTime = Date.now();

    try {
      const adapters = getAdapterRegistry();
      const currentSeason = new Date().getFullYear();

      // Fetch upcoming games
      const games = await prisma.game.findMany({
        where: {
          scheduledTime: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: 'scheduled',
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      });

      // Fetch odds for all upcoming games
      const { data: oddsLines, metadata } = await adapters.odds.fetch({
        sport: 'nfl',
        season: currentSeason,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      let storedCount = 0;

      for (const odds of oddsLines) {
        // Find matching game (simplified - in production, use external IDs)
        const game = games.find(g =>
          g.homeTeam.abbreviation === odds.homeTeam ||
          g.awayTeam.abbreviation === odds.awayTeam
        );

        if (!game) continue;

        // Store odds snapshot
        await prisma.oddsSnapshot.create({
          data: {
            gameId: game.id,
            providerName: odds.bookmaker,
            homeMoneyline: odds.homeMoneyline,
            awayMoneyline: odds.awayMoneyline,
            homeSpread: odds.homeSpread,
            homeSpreadOdds: odds.homeSpreadOdds,
            awaySpread: odds.awaySpread,
            awaySpreadOdds: odds.awaySpreadOdds,
            overUnder: odds.overUnder,
            overOdds: odds.overOdds,
            underOdds: odds.underOdds,
            dataSource: metadata.source,
            dataFetchedAt: metadata.fetchedAt,
          },
        });

        storedCount++;
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `Stored ${storedCount} odds snapshots`,
        duration,
        itemsProcessed: storedCount,
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
