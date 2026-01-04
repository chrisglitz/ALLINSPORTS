/**
 * Mock Odds Adapter
 * Generates realistic betting odds data for testing
 */

import { AbstractBaseAdapter } from '../base-adapter';
import {
  OddsAdapter,
  FetchOddsParams,
  OddsLine,
  ProviderType,
} from '../types';

const BOOKMAKERS = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'];

export class MockOddsAdapter extends AbstractBaseAdapter<FetchOddsParams, OddsLine[]> implements OddsAdapter {
  constructor() {
    super({
      providerName: 'MockOddsAdapter',
      providerType: ProviderType.ODDS,
      version: '1.0.0',
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
      },
    });
  }

  async fetch(params: FetchOddsParams) {
    await this.sleep(100); // Simulate network latency

    const odds: OddsLine[] = [];

    // Generate odds for a game
    const numGames = params.gameId ? 1 : Math.floor(Math.random() * 8) + 4;

    for (let i = 0; i < numGames; i++) {
      const gameId = params.gameId || `game_${i}`;

      // Generate odds from multiple bookmakers
      for (const bookmaker of BOOKMAKERS) {
        odds.push(this.generateOddsLine(gameId, bookmaker));
      }
    }

    return this.createResponse(odds, new Date());
  }

  private generateOddsLine(gameId: string, bookmaker: string): OddsLine {
    // Generate realistic spread (between -14 and +14)
    const homeSpread = (Math.random() * 28 - 14).toFixed(1);
    const homeSpreadNum = parseFloat(homeSpread);

    // Moneyline based on spread
    const homeMoneyline = this.calculateMoneyline(homeSpreadNum);
    const awayMoneyline = this.calculateMoneyline(-homeSpreadNum);

    // Total (over/under) between 37.5 and 57.5
    const overUnder = (Math.random() * 20 + 37.5).toFixed(1);

    return {
      gameId,
      homeTeam: 'Home Team',
      awayTeam: 'Away Team',
      homeMoneyline,
      awayMoneyline,
      homeSpread: homeSpreadNum,
      homeSpreadOdds: -110,
      awaySpread: -homeSpreadNum,
      awaySpreadOdds: -110,
      overUnder: parseFloat(overUnder),
      overOdds: -110,
      underOdds: -110,
      bookmaker,
      lastUpdate: new Date(),
    };
  }

  private calculateMoneyline(spread: number): number {
    // Simplified conversion: larger spread = bigger favorite
    if (spread < 0) {
      // Favorite
      return Math.floor(-150 + (spread * 15));
    } else {
      // Underdog
      return Math.floor(130 + (spread * 10));
    }
  }

  protected async performHealthCheck(): Promise<void> {
    await this.sleep(50);
  }
}
