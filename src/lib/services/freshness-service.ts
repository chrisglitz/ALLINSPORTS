/**
 * Data Freshness Service
 * Evaluates freshness of all data sources
 */

import { FRESHNESS_THRESHOLDS } from '../constants/freshness-thresholds';

export enum FreshnessStatus {
  FRESH = 'FRESH',
  AGING = 'AGING',
  STALE = 'STALE',
}

export interface FreshnessResult {
  status: FreshnessStatus;
  timestamp: Date;
  ageMinutes: number;
  threshold: number;
}

export interface GameFreshness {
  odds: FreshnessResult;
  injuries: FreshnessResult;
  weather?: FreshnessResult;
  stats: FreshnessResult;
  hasStaleData: boolean;
  confidencePenalty: number; // 0-100 percentage reduction
}

export class FreshnessService {
  /**
   * Evaluate freshness for all data types in a game
   */
  evaluateFreshness(gameData: {
    scheduledTime: Date;
    oddsTimestamp?: Date;
    injuriesTimestamp?: Date;
    weatherTimestamp?: Date;
    statsTimestamp?: Date;
    isOutdoorVenue?: boolean;
  }): GameFreshness {
    const now = new Date();
    const isGameDay = this.isGameDay(gameData.scheduledTime, now);

    const odds = this.evaluateOdds(gameData.oddsTimestamp, isGameDay);
    const injuries = this.evaluateInjuries(gameData.injuriesTimestamp, isGameDay);
    const weather = gameData.isOutdoorVenue
      ? this.evaluateWeather(gameData.weatherTimestamp, isGameDay)
      : undefined;
    const stats = this.evaluateStats(gameData.statsTimestamp);

    const hasStaleData = [odds, injuries, weather, stats]
      .filter(Boolean)
      .some(r => r!.status === FreshnessStatus.STALE);

    const confidencePenalty = this.calculateConfidencePenalty({
      odds,
      injuries,
      weather,
      stats,
    });

    return {
      odds,
      injuries,
      weather,
      stats,
      hasStaleData,
      confidencePenalty,
    };
  }

  private evaluateOdds(
    timestamp: Date | undefined,
    isGameDay: boolean
  ): FreshnessResult {
    if (!timestamp) {
      return {
        status: FreshnessStatus.STALE,
        timestamp: new Date(0),
        ageMinutes: Infinity,
        threshold: 0,
      };
    }

    const threshold = isGameDay
      ? FRESHNESS_THRESHOLDS.odds.gameDay
      : FRESHNESS_THRESHOLDS.odds.otherwise;

    return this.evaluateTimestamp(timestamp, threshold);
  }

  private evaluateInjuries(
    timestamp: Date | undefined,
    isGameDay: boolean
  ): FreshnessResult {
    if (!timestamp) {
      return {
        status: FreshnessStatus.STALE,
        timestamp: new Date(0),
        ageMinutes: Infinity,
        threshold: 0,
      };
    }

    const threshold = isGameDay
      ? FRESHNESS_THRESHOLDS.injuries.gameDay
      : FRESHNESS_THRESHOLDS.injuries.otherwise;

    return this.evaluateTimestamp(timestamp, threshold);
  }

  private evaluateWeather(
    timestamp: Date | undefined,
    isGameDay: boolean
  ): FreshnessResult {
    if (!timestamp) {
      return {
        status: FreshnessStatus.STALE,
        timestamp: new Date(0),
        ageMinutes: Infinity,
        threshold: 0,
      };
    }

    const threshold = isGameDay
      ? FRESHNESS_THRESHOLDS.weather.gameDay
      : FRESHNESS_THRESHOLDS.weather.otherwise;

    return this.evaluateTimestamp(timestamp, threshold);
  }

  private evaluateStats(timestamp: Date | undefined): FreshnessResult {
    if (!timestamp) {
      return {
        status: FreshnessStatus.STALE,
        timestamp: new Date(0),
        ageMinutes: Infinity,
        threshold: 0,
      };
    }

    return this.evaluateTimestamp(timestamp, FRESHNESS_THRESHOLDS.stats);
  }

  private evaluateTimestamp(
    timestamp: Date,
    thresholdMinutes: number
  ): FreshnessResult {
    const now = new Date();
    const ageMs = now.getTime() - timestamp.getTime();
    const ageMinutes = ageMs / (1000 * 60);

    let status: FreshnessStatus;
    if (ageMinutes < thresholdMinutes * 0.5) {
      status = FreshnessStatus.FRESH;
    } else if (ageMinutes < thresholdMinutes) {
      status = FreshnessStatus.AGING;
    } else {
      status = FreshnessStatus.STALE;
    }

    return {
      status,
      timestamp,
      ageMinutes: Math.round(ageMinutes),
      threshold: thresholdMinutes,
    };
  }

  private calculateConfidencePenalty(results: {
    odds: FreshnessResult;
    injuries: FreshnessResult;
    weather?: FreshnessResult;
    stats: FreshnessResult;
  }): number {
    let penalty = 0;

    // Apply penalties based on staleness
    const dataPoints = [results.odds, results.injuries, results.weather, results.stats].filter(
      Boolean
    ) as FreshnessResult[];

    for (const result of dataPoints) {
      if (result.status === FreshnessStatus.AGING) {
        penalty += 10;
      } else if (result.status === FreshnessStatus.STALE) {
        penalty += 30;
      }
    }

    return Math.min(penalty, 100); // Cap at 100%
  }

  private isGameDay(gameTime: Date, now: Date): boolean {
    const diffHours = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24; // Within 24 hours of game
  }
}
