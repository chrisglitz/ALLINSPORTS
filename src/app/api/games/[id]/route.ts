import { NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';
import { PredictionService } from '@/lib/services/prediction-service';
import { FreshnessService } from '@/lib/services/freshness-service';

const gameService = new GameService();
const predictionService = new PredictionService();
const freshnessService = new FreshnessService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const game = await gameService.getGameById(params.id);

    // Evaluate data freshness
    const freshness = freshnessService.evaluateFreshness({
      scheduledTime: game.scheduledTime,
      oddsTimestamp: game.oddsSnapshots[0]?.dataFetchedAt,
      injuriesTimestamp: game.homeTeam.injuries[0]?.dataFetchedAt,
      weatherTimestamp: game.weatherSnapshots[0]?.dataFetchedAt,
      statsTimestamp: game.teamGameStats[0]?.dataFetchedAt,
      isOutdoorVenue: !game.venue?.isDome,
    });

    // Get prediction
    const prediction = await predictionService.getLatestPrediction(params.id);

    return NextResponse.json({
      game,
      freshness,
      prediction,
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 404 }
    );
  }
}
