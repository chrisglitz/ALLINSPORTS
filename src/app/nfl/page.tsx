import Link from 'next/link';

export default async function NFLGamesPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const selectedDate = searchParams.date
    ? new Date(searchParams.date)
    : new Date();

  // In a real implementation, this would fetch from GameService
  // const games = await gameService.getGamesForDate(selectedDate);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">NFL Games</h2>
        <p className="text-gray-600">
          Viewing games for {selectedDate.toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🏗️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Games List - Coming Soon
        </h3>
        <p className="text-gray-600 mb-6">
          This page will display all NFL games for the selected date with:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600 mb-6">
          <li>✓ Date selector (prev/next, date picker)</li>
          <li>✓ Game cards with teams, time, and odds</li>
          <li>✓ Freshness badges (green/yellow/red)</li>
          <li>✓ Weather and injury indicators</li>
          <li>✓ Click to view detailed matchup analysis</li>
        </ul>
        <p className="text-sm text-gray-500">
          To implement: Connect to GameService and render GameList component
        </p>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Next Steps:</strong> Run <code className="bg-blue-100 px-2 py-1 rounded">npm run db:seed</code>
          to populate sample games, then implement the GameList component using the GameService.
        </p>
      </div>
    </div>
  );
}
