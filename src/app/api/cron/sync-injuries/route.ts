import { NextResponse } from 'next/server';
import { SyncInjuriesJob } from '@/lib/jobs/sync-injuries-job';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const job = new SyncInjuriesJob();
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

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
