/**
 * Mock Stats Adapter
 * Generates realistic NFL stats data for testing
 */

import { AbstractBaseAdapter } from '../base-adapter';
import {
  StatsAdapter,
  FetchStatsParams,
  GameStats,
  ProviderType,
} from '../types';

export class MockStatsAdapter extends AbstractBaseAdapter<FetchStatsParams, GameStats[]> implements StatsAdapter {
  constructor() {
    super({
      providerName: 'MockStatsAdapter',
      providerType: ProviderType.STATS,
      version: '1.0.0',
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
      },
    });
  }

  async fetch(params: FetchStatsParams) {
    await this.sleep(150); // Simulate network latency

    const stats: GameStats[] = [];

    // Generate stats for requested game(s)
    if (params.gameId) {
      stats.push(this.generateGameStats(params.gameId));
    } else {
      // Generate stats for multiple games
      const numGames = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < numGames; i++) {
        stats.push(this.generateGameStats(`game_${i}`));
      }
    }

    return this.createResponse(stats, new Date());
  }

  private generateGameStats(gameId: string): GameStats {
    return {
      gameId,
      homeTeamStats: {
        teamId: 'home_team',
        teamName: 'Home Team',
        totalYards: Math.floor(Math.random() * 200) + 250,
        passingYards: Math.floor(Math.random() * 150) + 150,
        rushingYards: Math.floor(Math.random() * 100) + 80,
        turnovers: Math.floor(Math.random() * 3),
        passCompletions: Math.floor(Math.random() * 10) + 20,
        passAttempts: Math.floor(Math.random() * 15) + 30,
        rushAttempts: Math.floor(Math.random() * 10) + 20,
        timeOfPossession: Math.floor(Math.random() * 600) + 1500,
        thirdDownConversions: Math.floor(Math.random() * 6) + 4,
        thirdDownAttempts: Math.floor(Math.random() * 6) + 10,
        redZoneAttempts: Math.floor(Math.random() * 3) + 2,
        redZoneScores: Math.floor(Math.random() * 2) + 1,
        sacks: Math.random() * 3 + 1,
        tacklesForLoss: Math.floor(Math.random() * 5) + 3,
        qbHits: Math.floor(Math.random() * 6) + 4,
        passesDefended: Math.floor(Math.random() * 8) + 5,
        fieldGoalsMade: Math.floor(Math.random() * 3) + 1,
        fieldGoalsAttempted: Math.floor(Math.random() * 2) + 2,
      },
      awayTeamStats: {
        teamId: 'away_team',
        teamName: 'Away Team',
        totalYards: Math.floor(Math.random() * 200) + 250,
        passingYards: Math.floor(Math.random() * 150) + 150,
        rushingYards: Math.floor(Math.random() * 100) + 80,
        turnovers: Math.floor(Math.random() * 3),
        passCompletions: Math.floor(Math.random() * 10) + 20,
        passAttempts: Math.floor(Math.random() * 15) + 30,
        rushAttempts: Math.floor(Math.random() * 10) + 20,
        timeOfPossession: Math.floor(Math.random() * 600) + 1500,
        thirdDownConversions: Math.floor(Math.random() * 6) + 4,
        thirdDownAttempts: Math.floor(Math.random() * 6) + 10,
        redZoneAttempts: Math.floor(Math.random() * 3) + 2,
        redZoneScores: Math.floor(Math.random() * 2) + 1,
        sacks: Math.random() * 3 + 1,
        tacklesForLoss: Math.floor(Math.random() * 5) + 3,
        qbHits: Math.floor(Math.random() * 6) + 4,
        passesDefended: Math.floor(Math.random() * 8) + 5,
        fieldGoalsMade: Math.floor(Math.random() * 3) + 1,
        fieldGoalsAttempted: Math.floor(Math.random() * 2) + 2,
      },
      playerStats: [
        {
          playerId: 'qb1',
          playerName: 'Patrick Mahomes',
          position: 'QB',
          passYards: Math.floor(Math.random() * 150) + 200,
          passTDs: Math.floor(Math.random() * 3) + 1,
          interceptions: Math.floor(Math.random() * 2),
          passAttempts: Math.floor(Math.random() * 15) + 30,
          passCompletions: Math.floor(Math.random() * 10) + 20,
        },
        {
          playerId: 'rb1',
          playerName: 'Christian McCaffrey',
          position: 'RB',
          rushYards: Math.floor(Math.random() * 60) + 60,
          rushTDs: Math.floor(Math.random() * 2),
          rushAttempts: Math.floor(Math.random() * 10) + 15,
          receptions: Math.floor(Math.random() * 5) + 3,
          recYards: Math.floor(Math.random() * 40) + 30,
        },
      ],
    };
  }

  protected async performHealthCheck(): Promise<void> {
    await this.sleep(50);
  }
}
