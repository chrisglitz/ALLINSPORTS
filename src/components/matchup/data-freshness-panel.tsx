import { FreshnessStatus, GameFreshness } from '@/lib/services/freshness-service';

interface DataFreshnessPanelProps {
  freshness: GameFreshness;
}

export function DataFreshnessPanel({ freshness }: DataFreshnessPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Data Freshness</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FreshnessItem label="Odds" result={freshness.odds} />
        <FreshnessItem label="Injuries" result={freshness.injuries} />
        {freshness.weather && <FreshnessItem label="Weather" result={freshness.weather} />}
        <FreshnessItem label="Stats" result={freshness.stats} />
      </div>

      {freshness.hasStaleData && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            ⚠️ Confidence penalty: <span className="font-semibold text-red-600">-{freshness.confidencePenalty}%</span>
          </p>
        </div>
      )}
    </div>
  );
}

interface FreshnessItemResult {
  status: FreshnessStatus;
  ageMinutes: number;
}

function FreshnessItem({ label, result }: { label: string; result: FreshnessItemResult }) {
  const statusColors: Record<FreshnessStatus, string> = {
    [FreshnessStatus.FRESH]: 'bg-green-100 text-green-800',
    [FreshnessStatus.AGING]: 'bg-yellow-100 text-yellow-800',
    [FreshnessStatus.STALE]: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<FreshnessStatus, string> = {
    [FreshnessStatus.FRESH]: '✓',
    [FreshnessStatus.AGING]: '⚠',
    [FreshnessStatus.STALE]: '✗',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[result.status]}`}>
          {statusIcons[result.status]} {result.status}
        </span>
      </div>
      <div className="text-xs text-gray-500">
        {result.ageMinutes < 60
          ? `${result.ageMinutes}m ago`
          : result.ageMinutes < 1440
          ? `${Math.floor(result.ageMinutes / 60)}h ago`
          : `${Math.floor(result.ageMinutes / 1440)}d ago`}
      </div>
    </div>
  );
}
