/**
 * Mock Schedule Adapter
 * Generates realistic NFL schedule data for testing
 */

import { AbstractBaseAdapter } from '../base-adapter';
import {
  ScheduleAdapter,
  FetchScheduleParams,
  ScheduleGame,
  ProviderType,
} from '../types';

const NFL_TEAMS = [
  { name: 'Kansas City Chiefs', abbreviation: 'KC', city: 'Kansas City' },
  { name: 'Buffalo Bills', abbreviation: 'BUF', city: 'Buffalo' },
  { name: 'San Francisco 49ers', abbreviation: 'SF', city: 'San Francisco' },
  { name: 'Philadelphia Eagles', abbreviation: 'PHI', city: 'Philadelphia' },
  { name: 'Dallas Cowboys', abbreviation: 'DAL', city: 'Dallas' },
  { name: 'Miami Dolphins', abbreviation: 'MIA', city: 'Miami' },
  { name: 'Detroit Lions', abbreviation: 'DET', city: 'Detroit' },
  { name: 'Baltimore Ravens', abbreviation: 'BAL', city: 'Baltimore' },
  { name: 'Green Bay Packers', abbreviation: 'GB', city: 'Green Bay' },
  { name: 'Cincinnati Bengals', abbreviation: 'CIN', city: 'Cincinnati' },
  { name: 'Los Angeles Rams', abbreviation: 'LAR', city: 'Los Angeles' },
  { name: 'Seattle Seahawks', abbreviation: 'SEA', city: 'Seattle' },
  { name: 'New York Jets', abbreviation: 'NYJ', city: 'New York' },
  { name: 'Cleveland Browns', abbreviation: 'CLE', city: 'Cleveland' },
  { name: 'Jacksonville Jaguars', abbreviation: 'JAX', city: 'Jacksonville' },
  { name: 'Las Vegas Raiders', abbreviation: 'LV', city: 'Las Vegas' },
];

const VENUES = [
  { name: 'Arrowhead Stadium', city: 'Kansas City', state: 'MO', isDome: false },
  { name: 'Highmark Stadium', city: 'Buffalo', state: 'NY', isDome: false },
  { name: "Levi's Stadium", city: 'Santa Clara', state: 'CA', isDome: false },
  { name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', isDome: false },
  { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', isDome: true },
  { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', isDome: false },
  { name: 'Ford Field', city: 'Detroit', state: 'MI', isDome: true },
  { name: 'M&T Bank Stadium', city: 'Baltimore', state: 'MD', isDome: false },
];

export class MockScheduleAdapter extends AbstractBaseAdapter<FetchScheduleParams, ScheduleGame[]> implements ScheduleAdapter {
  constructor() {
    super({
      providerName: 'MockScheduleAdapter',
      providerType: ProviderType.SCHEDULE,
      version: '1.0.0',
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
      },
    });
  }

  async fetch(params: FetchScheduleParams) {
    await this.sleep(100); // Simulate network latency

    const games: ScheduleGame[] = [];
    const { season, week, startDate, endDate } = params;

    // Generate games for the specified week or date range
    const weeksToGenerate = week ? [week] : [1, 2, 3, 4, 5];

    for (const weekNum of weeksToGenerate) {
      const weekGames = this.generateWeekGames(season, weekNum);
      games.push(...weekGames);
    }

    // Filter by date range if provided
    let filteredGames = games;
    if (startDate) {
      filteredGames = filteredGames.filter(g => g.scheduledTime >= startDate);
    }
    if (endDate) {
      filteredGames = filteredGames.filter(g => g.scheduledTime <= endDate);
    }

    return this.createResponse(filteredGames, new Date());
  }

  private generateWeekGames(season: number, week: number): ScheduleGame[] {
    const games: ScheduleGame[] = [];
    const gamesPerWeek = 8; // Simplified: 8 games per week

    for (let i = 0; i < gamesPerWeek; i++) {
      const awayTeamIndex = (i * 2) % NFL_TEAMS.length;
      const homeTeamIndex = (i * 2 + 1) % NFL_TEAMS.length;

      const awayTeam = NFL_TEAMS[awayTeamIndex];
      const homeTeam = NFL_TEAMS[homeTeamIndex];
      const venue = VENUES[homeTeamIndex % VENUES.length];

      // Schedule games on Sundays at various times
      const baseDate = new Date(season, 8, 1); // September 1st
      const daysToAdd = (week - 1) * 7 + (i % 3); // Spread across Thu/Sun/Mon
      const scheduledTime = new Date(baseDate);
      scheduledTime.setDate(baseDate.getDate() + daysToAdd);
      scheduledTime.setHours(13 + (i % 3) * 4, 0, 0, 0); // 1 PM, 5 PM, or 9 PM

      games.push({
        externalId: `nfl_${season}_w${week}_${awayTeam.abbreviation}_${homeTeam.abbreviation}`,
        homeTeam: {
          name: homeTeam.name,
          abbreviation: homeTeam.abbreviation,
          externalId: `nfl_${homeTeam.abbreviation}`,
        },
        awayTeam: {
          name: awayTeam.name,
          abbreviation: awayTeam.abbreviation,
          externalId: `nfl_${awayTeam.abbreviation}`,
        },
        venue: {
          name: venue.name,
          city: venue.city,
          state: venue.state,
          isDome: venue.isDome,
        },
        scheduledTime,
        week,
        seasonType: 'REG',
        season,
        status: scheduledTime < new Date() ? 'final' : 'scheduled',
        homeScore: scheduledTime < new Date() ? Math.floor(Math.random() * 20) + 14 : undefined,
        awayScore: scheduledTime < new Date() ? Math.floor(Math.random() * 20) + 14 : undefined,
      });
    }

    return games;
  }

  protected async performHealthCheck(): Promise<void> {
    // Mock health check - always succeeds
    await this.sleep(50);
  }
}
