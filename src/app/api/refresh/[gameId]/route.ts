import { NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';
import { SyncScheduleJob } from '@/lib/jobs/sync-schedule-job';
import { SyncOddsJob } from '@/lib/jobs/sync-odds-job';
import { SyncInjuriesJob } from '@/lib/jobs/sync-injuries-job';
import { RunPredictionsJob } from '@/lib/jobs/run-predictions-job';

const gameService = new GameService();

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    // Run all sync jobs for this game's data
    const scheduleJob = new SyncScheduleJob();
    const oddsJob = new SyncOddsJob();
    const injuriesJob = new SyncInjuriesJob();
    const predictionsJob = new RunPredictionsJob();

    await Promise.all([
      scheduleJob.execute(),
      oddsJob.execute(),
      injuriesJob.execute(),
    ]);

    // Run predictions after data sync
    await predictionsJob.execute();

    // Invalidate cache
    await gameService.invalidateGameCache(params.gameId);

    return NextResponse.json({
      success: true,
      message: 'Game data refreshed successfully',
    });
  } catch (error) {
    console.error('Error refreshing game:', error);
    return NextResponse.json(
      { error: 'Failed to refresh game', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
