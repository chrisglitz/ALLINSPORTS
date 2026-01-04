/**
 * Sync Injuries Job
 * Fetches and updates injury reports
 */

import { Job, JobConfig, JobResult, JobType } from './types';
import { getAdapterRegistry } from '../adapters/factory';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SyncInjuriesJob implements Job {
  config: JobConfig = {
    type: JobType.SYNC_INJURIES,
    name: 'Sync Injuries',
    description: 'Fetch and update injury reports',
    schedule: '*/30 * * * *', // Every 30 minutes
    timeout: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  };

  async execute(): Promise<JobResult> {
    const startTime = Date.now();

    try {
      const adapters = getAdapterRegistry();
      const currentSeason = new Date().getFullYear();

      // Fetch all teams
      const teams = await prisma.team.findMany({
        include: {
          league: true,
        },
      });

      let upsertedCount = 0;

      for (const team of teams) {
        // Fetch injury reports for this team
        const { data: injuries, metadata } = await adapters.injuries.fetch({
          teamId: team.id,
          season: currentSeason,
        });

        for (const injury of injuries) {
          // Find or create player
          const player = await prisma.player.upsert({
            where: {
              teamId_firstName_lastName: {
                teamId: team.id,
                firstName: injury.playerName.split(' ')[0],
                lastName: injury.playerName.split(' ').slice(1).join(' '),
              },
            },
            create: {
              teamId: team.id,
              firstName: injury.playerName.split(' ')[0],
              lastName: injury.playerName.split(' ').slice(1).join(' '),
              position: injury.position,
            },
            update: {},
          });

          // Calculate impact score (simplified)
          const impactScore = this.calculateImpactScore(injury.position, injury.designation);

          // Upsert injury
          await prisma.injury.upsert({
            where: {
              id: injury.playerId || `${player.id}_${injury.reportedDate.toISOString()}`,
            },
            create: {
              playerId: player.id,
              teamId: team.id,
              description: injury.description,
              designation: injury.designation,
              reportedDate: injury.reportedDate,
              impactScore,
              isResolved: false,
              dataSource: metadata.source,
              dataFetchedAt: metadata.fetchedAt,
            },
            update: {
              designation: injury.designation,
              description: injury.description,
              impactScore,
              dataSource: metadata.source,
              dataFetchedAt: metadata.fetchedAt,
            },
          });

          upsertedCount++;
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `Synced ${upsertedCount} injuries`,
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

  private calculateImpactScore(position: string, designation: string): number {
    // Simplified impact scoring
    const positionWeight: Record<string, number> = {
      QB: 100,
      RB: 70,
      WR: 70,
      TE: 60,
      OL: 65,
      DL: 65,
      LB: 60,
      CB: 70,
      S: 60,
      K: 30,
    };

    const designationWeight: Record<string, number> = {
      OUT: 1.0,
      IR: 1.0,
      DOUBTFUL: 0.8,
      QUESTIONABLE: 0.5,
      PROBABLE: 0.2,
    };

    const baseWeight = positionWeight[position] || 50;
    const statusWeight = designationWeight[designation] || 0.3;

    return Math.round(baseWeight * statusWeight);
  }
}
