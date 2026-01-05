import { GameService } from '@/lib/services/game-service';
import { PredictionService } from '@/lib/services/prediction-service';
import { FreshnessService } from '@/lib/services/freshness-service';
import { DataFreshnessPanel } from '@/components/matchup/data-freshness-panel';
import { PredictionDisplay } from '@/components/matchup/prediction-display';
import { OddsComparison } from '@/components/matchup/odds-comparison';

const gameService = new GameService();
const predictionService = new PredictionService();
const freshnessService = new FreshnessService();

interface GameDetailPageProps {
  params: { gameId: string };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  let game, freshness, prediction;

  try {
    game = await gameService.getGameById(params.gameId);

    // Evaluate data freshness
    freshness = freshnessService.evaluateFreshness({
      scheduledTime: game.scheduledTime,
      oddsTimestamp: game.oddsSnapshots[0]?.dataFetchedAt,
      injuriesTimestamp: game.homeTeam.injuries[0]?.dataFetchedAt,
      weatherTimestamp: game.weatherSnapshots[0]?.dataFetchedAt,
      statsTimestamp: game.teamGameStats[0]?.dataFetchedAt,
      isOutdoorVenue: !game.venue?.isDome,
    });

    // Get prediction
    prediction = await predictionService.getLatestPrediction(params.gameId);
  } catch (error) {
    console.error('Error loading game:', error);
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Game Not Found</h3>
        <p className="text-gray-600 mb-6">
          Unable to load game details. The game may not exist or there was an error.
        </p>
        <a href="/nfl" className="text-blue-600 hover:underline">
          ← Back to Games
        </a>
      </div>
    );
  }

  const gameTime = new Date(game.scheduledTime);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <a href="/nfl" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Games
        </a>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-4">
            {gameTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            {' • '}
            {gameTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{game.awayTeam.name}</div>
              <div className="text-gray-500">{game.awayTeam.abbreviation}</div>
            </div>

            <div className="text-3xl font-bold text-gray-400 mx-8">@</div>

            <div className="flex-1 text-right">
              <div className="text-2xl font-bold text-gray-900">{game.homeTeam.name}</div>
              <div className="text-gray-500">{game.homeTeam.abbreviation}</div>
            </div>
          </div>

          {game.venue && (
            <div className="text-sm text-gray-600">
              📍 {game.venue.name}, {game.venue.city}
            </div>
          )}
        </div>
      </div>

      {/* Data Freshness Panel */}
      <DataFreshnessPanel freshness={freshness} />

      {/* Stale Data Warning */}
      {freshness.hasStaleData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-3">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Stale Data Warning</h4>
              <p className="text-sm text-yellow-800">
                Some data sources are outdated. Prediction confidence has been reduced by {freshness.confidencePenalty}%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prediction */}
      <PredictionDisplay prediction={prediction} game={game} />

      {/* Odds Comparison */}
      {game.oddsSnapshots && game.oddsSnapshots.length > 0 && (
        <OddsComparison odds={game.oddsSnapshots} />
      )}

      {/* Implementation Note */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Additional Sections</h3>
        <p className="text-sm text-blue-800 mb-3">
          The following sections are defined in the architecture but not yet implemented:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Team Stats (season stats + recent form)</li>
          <li>• Player Props (passing/rushing/receiving)</li>
          <li>• Injuries (detailed reports + impact scores)</li>
          <li>• Weather (hourly forecast + severity analysis)</li>
          <li>• External Factors (rest, referee, pace breakdown)</li>
          <li>• Model Explanation (factor contributions)</li>
        </ul>
      </div>
    </div>
  );
}
