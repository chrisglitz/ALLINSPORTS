/**
 * Mock Injuries Adapter
 * Generates realistic injury report data for testing
 */

import { AbstractBaseAdapter } from '../base-adapter';
import {
  InjuriesAdapter,
  FetchInjuriesParams,
  InjuryReport,
  ProviderType,
} from '../types';

const INJURY_TYPES = [
  'Knee injury',
  'Ankle sprain',
  'Shoulder injury',
  'Hamstring strain',
  'Concussion',
  'Rib injury',
  'Back injury',
  'Quad injury',
  'Groin strain',
  'Foot injury',
];

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'];

export class MockInjuriesAdapter extends AbstractBaseAdapter<FetchInjuriesParams, InjuryReport[]> implements InjuriesAdapter {
  constructor() {
    super({
      providerName: 'MockInjuriesAdapter',
      providerType: ProviderType.INJURIES,
      version: '1.0.0',
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
      },
    });
  }

  async fetch(params: FetchInjuriesParams) {
    await this.sleep(120); // Simulate network latency

    const injuries: InjuryReport[] = [];

    // Generate 0-5 injuries per team
    const numInjuries = Math.floor(Math.random() * 6);

    for (let i = 0; i < numInjuries; i++) {
      const designation = this.randomDesignation();
      const daysAgo = Math.floor(Math.random() * 7);
      const reportedDate = new Date();
      reportedDate.setDate(reportedDate.getDate() - daysAgo);

      injuries.push({
        playerId: `player_${i}`,
        playerName: this.randomPlayerName(),
        teamId: params.teamId || 'team_1',
        teamName: 'Mock Team',
        position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
        description: INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)],
        designation,
        reportedDate,
        estimatedReturn: designation !== 'OUT' && designation !== 'IR'
          ? this.estimateReturn(reportedDate)
          : undefined,
      });
    }

    return this.createResponse(injuries, new Date());
  }

  private randomDesignation(): 'OUT' | 'QUESTIONABLE' | 'DOUBTFUL' | 'PROBABLE' | 'IR' {
    const rand = Math.random();
    if (rand < 0.2) return 'OUT';
    if (rand < 0.5) return 'QUESTIONABLE';
    if (rand < 0.7) return 'DOUBTFUL';
    if (rand < 0.9) return 'PROBABLE';
    return 'IR';
  }

  private randomPlayerName(): string {
    const firstNames = ['Patrick', 'Travis', 'Tyreek', 'Josh', 'Justin', 'Lamar', 'Christian', 'CeeDee'];
    const lastNames = ['Mahomes', 'Kelce', 'Hill', 'Allen', 'Jefferson', 'Jackson', 'McCaffrey', 'Lamb'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private estimateReturn(reportedDate: Date): Date {
    const daysUntilReturn = Math.floor(Math.random() * 14) + 1;
    const returnDate = new Date(reportedDate);
    returnDate.setDate(returnDate.getDate() + daysUntilReturn);
    return returnDate;
  }

  protected async performHealthCheck(): Promise<void> {
    await this.sleep(50);
  }
}
