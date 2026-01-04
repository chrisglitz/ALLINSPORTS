/**
 * Prediction Service
 * Runs prediction model for games
 */

import { PrismaClient } from '@prisma/client';
import { FreshnessService } from './freshness-service';

const prisma = new PrismaClient();
const freshnessService = new FreshnessService();

export interface PredictionResult {
  homeWinProbability: number; // 0-100
  projectedHomeSpread: number;
  projectedTotal: number;
  confidenceScore: number; // 1-5
  edgeVsMarket: number | null;
  recommendation: 'BET_HOME' | 'BET_AWAY' | 'BET_OVER' | 'BET_UNDER' | 'NO_BET';
  factorBreakdown: {
    teamStrength: number;
    recentForm: number;
    homeField: number;
    injuries: number;
    weather: number;
    restTravel: number;
  };
}

export class PredictionService {
  /**
   * Get latest prediction for a game
   * Runs new prediction if none exists or if data is stale
   */
  async getLatestPrediction(gameId: string): Promise<PredictionResult> {
    // Check for existing prediction
    const existingRun = await prisma.modelRun.findFirst({
      where: { gameId },
      orderBy: { ranAt: 'desc' },
    });

    // If prediction is recent (< 15 minutes), return it
    if (existingRun && this.isPredictionFresh(existingRun.ranAt)) {
      return this.formatPrediction(existingRun);
    }

    // Run new prediction
    return this.runPrediction(gameId);
  }

  /**
   * Run prediction model for a game
   */
  async runPrediction(gameId: string): Promise<PredictionResult> {
    const game = await this.fetchGameData(gameId);

    // Evaluate data freshness
    const freshness = freshnessService.evaluateFreshness({
      scheduledTime: game.scheduledTime,
      oddsTimestamp: game.oddsSnapshots[0]?.dataFetchedAt,
      injuriesTimestamp: game.homeTeam.injuries[0]?.dataFetchedAt,
      weatherTimestamp: game.weatherSnapshots[0]?.dataFetchedAt,
      statsTimestamp: game.teamGameStats[0]?.dataFetchedAt,
      isOutdoorVenue: !game.venue?.isDome,
    });

    // Collect baseline inputs
    const baselineInputs = {
      homeElo: 1500, // Placeholder - would fetch from teamStrengthElo
      awayElo: 1500,
      homeRecentForm: 0.5, // Placeholder
      awayRecentForm: 0.5,
      homeFieldAdvantage: 2.5,
    };

    // Calculate prediction
    const eloSpread = (baselineInputs.homeElo - baselineInputs.awayElo) / 25;
    const projectedHomeSpread = eloSpread + baselineInputs.homeFieldAdvantage;

    const homeWinProbability = this.calculateWinProbability(projectedHomeSpread);
    const projectedTotal = 45.0; // Placeholder - would calculate from pace/efficiency

    // Calculate confidence with freshness penalty
    let confidence = 5;
    if (freshness.confidencePenalty > 0) {
      confidence = Math.max(1, confidence - Math.floor(freshness.confidencePenalty / 20));
    }

    // Calculate edge vs market
    const marketSpread = game.oddsSnapshots[0]?.homeSpread;
    const edgeVsMarket = marketSpread ? projectedHomeSpread - marketSpread : null;

    // Recommendation
    const recommendation = this.calculateRecommendation(edgeVsMarket);

    // Factor breakdown
    const factorBreakdown = {
      teamStrength: eloSpread,
      recentForm: 0,
      homeField: baselineInputs.homeFieldAdvantage,
      injuries: 0,
      weather: 0,
      restTravel: 0,
    };

    // Store prediction
    await prisma.modelRun.create({
      data: {
        gameId,
        modelVersion: 'v1.0-mvp',
        baselineInputs: baselineInputs,
        externalFactors: {},
        optionalFactors: null,
        optionalFactorsEnabled: false,
        dataTimestamps: {
          odds: game.oddsSnapshots[0]?.dataFetchedAt,
          injuries: game.homeTeam.injuries[0]?.dataFetchedAt,
        },
        homeWinProbability,
        projectedHomeSpread,
        projectedTotal,
        confidenceScore: confidence,
        edgeVsMarket,
        recommendation,
        factorBreakdown,
      },
    });

    return {
      homeWinProbability,
      projectedHomeSpread,
      projectedTotal,
      confidenceScore: confidence,
      edgeVsMarket,
      recommendation,
      factorBreakdown,
    };
  }

  private calculateWinProbability(spread: number): number {
    // Simplified conversion: spread to win probability
    // Using logistic function: P = 1 / (1 + e^(-spread/4))
    const probability = 1 / (1 + Math.exp(-spread / 4));
    return Math.round(probability * 100);
  }

  private calculateRecommendation(
    edge: number | null
  ): 'BET_HOME' | 'BET_AWAY' | 'BET_OVER' | 'BET_UNDER' | 'NO_BET' {
    const EDGE_THRESHOLD = 2.0; // Need 2+ point edge to recommend

    if (!edge || Math.abs(edge) < EDGE_THRESHOLD) {
      return 'NO_BET';
    }

    return edge > 0 ? 'BET_HOME' : 'BET_AWAY';
  }

  private isPredictionFresh(ranAt: Date): boolean {
    const ageMinutes = (Date.now() - ranAt.getTime()) / (1000 * 60);
    return ageMinutes < 15;
  }

  private formatPrediction(modelRun: any): PredictionResult {
    return {
      homeWinProbability: modelRun.homeWinProbability,
      projectedHomeSpread: modelRun.projectedHomeSpread,
      projectedTotal: modelRun.projectedTotal,
      confidenceScore: modelRun.confidenceScore,
      edgeVsMarket: modelRun.edgeVsMarket,
      recommendation: modelRun.recommendation,
      factorBreakdown: modelRun.factorBreakdown,
    };
  }

  private async fetchGameData(gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: {
          include: {
            injuries: {
              where: { isResolved: false },
              orderBy: { dataFetchedAt: 'desc' },
              take: 1,
            },
          },
        },
        awayTeam: {
          include: {
            injuries: {
              where: { isResolved: false },
              orderBy: { dataFetchedAt: 'desc' },
              take: 1,
            },
          },
        },
        venue: true,
        oddsSnapshots: {
          orderBy: { dataFetchedAt: 'desc' },
          take: 1,
        },
        weatherSnapshots: {
          orderBy: { dataFetchedAt: 'desc' },
          take: 1,
        },
        teamGameStats: {
          orderBy: { dataFetchedAt: 'desc' },
          take: 2,
        },
      },
    });

    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    return game;
  }
}
