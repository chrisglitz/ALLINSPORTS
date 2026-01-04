/**
 * Game Service
 * Handles game data operations with caching
 */

import { PrismaClient, Game } from '@prisma/client';
import { CacheService } from './cache-service';

const prisma = new PrismaClient();
const cache = new CacheService();

export class GameService {
  /**
   * Get games for a specific date
   */
  async getGamesForDate(date: Date): Promise<Game[]> {
    const cacheKey = `games:date:${date.toISOString().split('T')[0]}`;

    // Check cache
    const cached = await cache.get<Game[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const games = await prisma.game.findMany({
      where: {
        scheduledTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        oddsSnapshots: {
          orderBy: {
            dataFetchedAt: 'desc',
          },
          take: 1,
        },
        injuries: {
          where: {
            isResolved: false,
          },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    // Cache for 5 minutes
    await cache.set(cacheKey, games, 5 * 60);

    return games;
  }

  /**
   * Get game by ID with all related data
   */
  async getGameById(gameId: string) {
    const cacheKey = `game:${gameId}`;

    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: {
          include: {
            venue: true,
            injuries: {
              where: { isResolved: false },
              include: { player: true },
            },
          },
        },
        awayTeam: {
          include: {
            injuries: {
              where: { isResolved: false },
              include: { player: true },
            },
          },
        },
        venue: true,
        oddsSnapshots: {
          orderBy: {
            dataFetchedAt: 'desc',
          },
          take: 10, // Last 10 snapshots for trend
        },
        weatherSnapshots: {
          orderBy: {
            forecastTime: 'asc',
          },
        },
        teamGameStats: {
          include: {
            team: true,
          },
        },
        externalFactorScores: true,
        modelRuns: {
          orderBy: {
            ranAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, game, 5 * 60);

    return game;
  }

  /**
   * Get upcoming games (next 7 days)
   */
  async getUpcomingGames(limit = 20) {
    const cacheKey = `games:upcoming:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const games = await prisma.game.findMany({
      where: {
        scheduledTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'scheduled',
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
      take: limit,
    });

    await cache.set(cacheKey, games, 10 * 60);

    return games;
  }

  /**
   * Invalidate cache for a specific game
   */
  async invalidateGameCache(gameId: string): Promise<void> {
    await cache.delete(`game:${gameId}`);
  }
}
