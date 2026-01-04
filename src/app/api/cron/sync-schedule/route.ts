import { NextResponse } from 'next/server';
import { SyncScheduleJob } from '@/lib/jobs/sync-schedule-job';

export async function GET(request: Request) {
  // Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const job = new SyncScheduleJob();
    const result = await job.execute();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Job failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow Vercel Cron to call this route
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
