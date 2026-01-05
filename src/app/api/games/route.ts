import { NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';

const gameService = new GameService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const games = await gameService.getGamesForDate(new Date(date));
      return NextResponse.json(games);
    }

    // Default: upcoming games
    const games = await gameService.getUpcomingGames(20);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
