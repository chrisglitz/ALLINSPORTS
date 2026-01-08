import { GameCard } from '@/components/games/game-card';
import { DateSelector } from '@/components/games/date-selector';
import { GameService } from '@/lib/services/game-service';

const gameService = new GameService();

interface NFLGamesPageProps {
  searchParams: { date?: string };
}

export default async function NFLGamesPage({ searchParams }: NFLGamesPageProps) {
  const selectedDate = searchParams.date
    ? new Date(searchParams.date)
    : new Date();

  // Fetch games for the selected date
  let games: Awaited<ReturnType<typeof gameService.getGamesForDate>> = [];
  try {
    games = await gameService.getGamesForDate(selectedDate);
  } catch (error) {
    console.error('Error fetching games:', error);
    games = [];
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">NFL Games</h2>
        <p className="text-gray-600">
          Pre-game forecasting with data freshness tracking
        </p>
      </div>

      <DateSelector selectedDate={selectedDate} />

      {games.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🏈</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Games Scheduled
          </h3>
          <p className="text-gray-600 mb-6">
            There are no NFL games scheduled for {selectedDate.toLocaleDateString()}.
          </p>
          <p className="text-sm text-gray-500">
            Try a different date or run <code className="bg-gray-100 px-2 py-1 rounded">npm run db:seed</code> to add sample games.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
