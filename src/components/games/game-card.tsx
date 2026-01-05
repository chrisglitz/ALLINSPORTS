interface Game {
  id: string;
  scheduledTime: Date;
  homeTeam: {
    name: string;
    abbreviation: string;
  };
  awayTeam: {
    name: string;
    abbreviation: string;
  };
  venue?: {
    name: string;
    city: string;
  };
  oddsSnapshots?: Array<{
    homeSpread?: number;
    homeMoneyline?: number;
    overUnder?: number;
    dataFetchedAt: Date;
  }>;
}

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const latestOdds = game.oddsSnapshots?.[0];
  const gameTime = new Date(game.scheduledTime);
  const isToday = gameTime.toDateString() === new Date().toDateString();

  return (
    <a
      href={`/nfl/${game.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      {/* Time */}
      <div className="text-sm text-gray-500 mb-4">
        {gameTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        {' • '}
        {gameTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        {isToday && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Today
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏈</span>
            <div>
              <div className="font-semibold text-gray-900">{game.awayTeam.name}</div>
              <div className="text-sm text-gray-500">{game.awayTeam.abbreviation}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {latestOdds?.homeSpread && latestOdds.homeSpread < 0 ? `${Math.abs(latestOdds.homeSpread)}` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center text-gray-400">
          <span className="text-sm">@</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏈</span>
            <div>
              <div className="font-semibold text-gray-900">{game.homeTeam.name}</div>
              <div className="text-sm text-gray-500">{game.homeTeam.abbreviation}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {latestOdds?.homeSpread ? `${latestOdds.homeSpread > 0 ? '+' : ''}${latestOdds.homeSpread}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Venue */}
      {game.venue && (
        <div className="text-sm text-gray-500 mb-3">
          📍 {game.venue.name}, {game.venue.city}
        </div>
      )}

      {/* Odds */}
      {latestOdds && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-sm">
            <span className="text-gray-500">Spread:</span>{' '}
            <span className="font-medium text-gray-900">
              {latestOdds.homeSpread ? `${latestOdds.homeSpread > 0 ? '+' : ''}${latestOdds.homeSpread}` : 'N/A'}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">O/U:</span>{' '}
            <span className="font-medium text-gray-900">
              {latestOdds.overUnder || 'N/A'}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {getTimeAgo(new Date(latestOdds.dataFetchedAt))}
          </div>
        </div>
      )}

      <div className="mt-3 text-sm text-blue-600 font-medium">
        View Details →
      </div>
    </a>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
