interface OddsSnapshotProps {
  odds: Array<{
    providerName: string;
    homeMoneyline?: number;
    awayMoneyline?: number;
    homeSpread?: number;
    homeSpreadOdds?: number;
    awaySpread?: number;
    awaySpreadOdds?: number;
    overUnder?: number;
    overOdds?: number;
    underOdds?: number;
    dataFetchedAt: Date;
  }>;
}

export function OddsComparison({ odds }: OddsSnapshotProps) {
  // Get the latest odds (most recent snapshot)
  const latestOdds = odds[0];

  // Get unique bookmakers from recent snapshots
  const bookmakers = Array.from(new Set(odds.slice(0, 4).map(o => o.providerName)));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Best Available Odds</h3>

      {latestOdds ? (
        <div className="space-y-6">
          {/* Moneyline */}
          {(latestOdds.homeMoneyline || latestOdds.awayMoneyline) && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Moneyline</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Away</div>
                  <div className="text-lg font-bold text-gray-900">
                    {latestOdds.awayMoneyline ? formatOdds(latestOdds.awayMoneyline) : 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Home</div>
                  <div className="text-lg font-bold text-gray-900">
                    {latestOdds.homeMoneyline ? formatOdds(latestOdds.homeMoneyline) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spread */}
          {(latestOdds.homeSpread || latestOdds.awaySpread) && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Spread</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Away</div>
                  <div className="text-lg font-bold text-gray-900">
                    {latestOdds.awaySpread ? `${latestOdds.awaySpread > 0 ? '+' : ''}${latestOdds.awaySpread}` : 'N/A'}
                    {latestOdds.awaySpreadOdds && (
                      <span className="text-sm text-gray-600 ml-2">({formatOdds(latestOdds.awaySpreadOdds)})</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Home</div>
                  <div className="text-lg font-bold text-gray-900">
                    {latestOdds.homeSpread ? `${latestOdds.homeSpread > 0 ? '+' : ''}${latestOdds.homeSpread}` : 'N/A'}
                    {latestOdds.homeSpreadOdds && (
                      <span className="text-sm text-gray-600 ml-2">({formatOdds(latestOdds.homeSpreadOdds)})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          {latestOdds.overUnder && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Total (Over/Under)</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Over</div>
                  <div className="text-lg font-bold text-gray-900">
                    {latestOdds.overUnder}
                    {latestOdds.overOdds && (
                      <span className="text-sm text-gray-600 ml-2">({formatOdds(latestOdds.overOdds)})</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Under</div>
                  <div className="text-lg font-bold text-gray-900">
                    {latestOdds.overUnder}
                    {latestOdds.underOdds && (
                      <span className="text-sm text-gray-600 ml-2">({formatOdds(latestOdds.underOdds)})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Last updated: {new Date(latestOdds.dataFetchedAt).toLocaleString()} • Source: {latestOdds.providerName}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No odds available for this game
        </div>
      )}
    </div>
  );
}

function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}
