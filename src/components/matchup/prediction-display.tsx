import { PredictionResult } from '@/lib/services/prediction-service';

interface PredictionDisplayProps {
  prediction: PredictionResult;
  game: any;
}

export function PredictionDisplay({ prediction, game }: PredictionDisplayProps) {
  const stars = '★'.repeat(prediction.confidenceScore) + '☆'.repeat(5 - prediction.confidenceScore);

  const recommendationColors = {
    BET_HOME: 'bg-blue-100 text-blue-800',
    BET_AWAY: 'bg-purple-100 text-purple-800',
    BET_OVER: 'bg-green-100 text-green-800',
    BET_UNDER: 'bg-orange-100 text-orange-800',
    NO_BET: 'bg-gray-100 text-gray-800',
  };

  const recommendationLabels = {
    BET_HOME: `Bet ${game.homeTeam.abbreviation}`,
    BET_AWAY: `Bet ${game.awayTeam.abbreviation}`,
    BET_OVER: 'Bet Over',
    BET_UNDER: 'Bet Under',
    NO_BET: 'No Bet / Low Edge',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 Model Prediction</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Win Probability</div>
          <div className="text-3xl font-bold text-gray-900">
            {game.homeTeam.abbreviation} {prediction.homeWinProbability}%
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Projected Spread</div>
          <div className="text-3xl font-bold text-gray-900">
            {prediction.projectedHomeSpread > 0 ? '+' : ''}{prediction.projectedHomeSpread.toFixed(1)}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Projected Total</div>
          <div className="text-3xl font-bold text-gray-900">
            {prediction.projectedTotal.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Confidence</div>
            <div className="text-2xl text-yellow-500">{stars}</div>
            <div className="text-xs text-gray-500 mt-1">{prediction.confidenceScore}/5</div>
          </div>

          {prediction.edgeVsMarket !== null && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Edge vs Market</div>
              <div className={`text-2xl font-bold ${prediction.edgeVsMarket > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {prediction.edgeVsMarket > 0 ? '+' : ''}{prediction.edgeVsMarket.toFixed(1)}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-2">Recommendation</div>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold ${recommendationColors[prediction.recommendation]}`}>
            {recommendationLabels[prediction.recommendation]}
          </div>
          {prediction.recommendation === 'NO_BET' && (
            <p className="text-sm text-gray-600 mt-2">
              Edge below threshold. Model does not recommend a bet on this game.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 mb-2">Factor Contributions</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {Object.entries(prediction.factorBreakdown).map(([factor, value]) => (
            <div key={factor} className="flex justify-between bg-gray-50 rounded px-2 py-1">
              <span className="text-gray-600 capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="font-medium text-gray-900">
                {typeof value === 'number' ? (value > 0 ? '+' : '') + value.toFixed(1) : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
