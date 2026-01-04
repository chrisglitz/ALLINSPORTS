import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to NFL Forecasting MVP
      </h2>

      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        A transparent, data-driven sports forecasting application focused on
        <strong> pre-game NFL predictions</strong> with an emphasis on
        data freshness, explainability, and ethical practices.
      </p>

      <div className="space-y-4">
        <Link
          href="/nfl"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          View NFL Games
        </Link>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Data Freshness</h3>
            <p className="text-sm text-gray-600">
              Every data point timestamped and labeled as FRESH, AGING, or STALE
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">Explainable Model</h3>
            <p className="text-sm text-gray-600">
              Clear factor weights and contributions—no black-box predictions
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Ethical Practices</h3>
            <p className="text-sm text-gray-600">
              No scraping, no rumors, prominent disclaimers on all pages
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
        <h3 className="font-semibold text-blue-900 mb-2">🚀 Getting Started</h3>
        <p className="text-sm text-blue-800">
          This is an MVP using mock data. To use real data, configure provider adapters
          and set <code className="bg-blue-100 px-2 py-1 rounded">USE_MOCK_DATA=false</code> in your environment.
        </p>
      </div>
    </div>
  );
}
