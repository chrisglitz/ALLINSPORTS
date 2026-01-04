/**
 * Simple Job Scheduler
 *
 * In production, this would be replaced by:
 * - Vercel Cron
 * - AWS EventBridge
 * - Bull/BullMQ with Redis
 *
 * For MVP, this provides a simple in-process scheduler for development
 */

import { Job, JobScheduler, JobStatus, JobType, JobResult } from './types';

export class SimpleJobScheduler implements JobScheduler {
  private jobs: Map<JobType, Job> = new Map();
  private statuses: Map<JobType, JobStatus> = new Map();
  private intervals: Map<JobType, NodeJS.Timeout> = new Map();

  register(job: Job): void {
    const { type, schedule, enabled } = job.config;

    this.jobs.set(type, job);
    this.statuses.set(type, {
      type,
      name: job.config.name,
      isRunning: false,
    });

    if (enabled) {
      this.scheduleJob(job);
    }

    console.log(`[Scheduler] Registered job: ${job.config.name}`);
  }

  unregister(jobType: JobType): void {
    const interval = this.intervals.get(jobType);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(jobType);
    }

    this.jobs.delete(jobType);
    this.statuses.delete(jobType);

    console.log(`[Scheduler] Unregistered job: ${jobType}`);
  }

  async trigger(jobType: JobType): Promise<JobResult> {
    const job = this.jobs.get(jobType);
    if (!job) {
      throw new Error(`Job not found: ${jobType}`);
    }

    return this.executeJob(job);
  }

  getStatus(): JobStatus[] {
    return Array.from(this.statuses.values());
  }

  private scheduleJob(job: Job): void {
    const { type, schedule } = job.config;

    // Parse cron-like schedule to interval
    // For MVP, we'll use simple intervals instead of full cron
    const intervalMs = this.parseSchedule(schedule);

    const interval = setInterval(async () => {
      await this.executeJob(job);
    }, intervalMs);

    this.intervals.set(type, interval);
  }

  private async executeJob(job: Job): Promise<JobResult> {
    const { type, name, timeout } = job.config;
    const status = this.statuses.get(type)!;

    // Skip if already running
    if (status.isRunning) {
      console.log(`[Scheduler] Job ${name} is already running, skipping`);
      return {
        success: false,
        message: 'Job already running',
        duration: 0,
      };
    }

    status.isRunning = true;
    status.lastRun = new Date();
    const startTime = Date.now();

    console.log(`[Scheduler] Starting job: ${name}`);

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(job.execute(), timeout);

      status.lastResult = result;
      status.isRunning = false;

      console.log(`[Scheduler] Job ${name} completed in ${result.duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: JobResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        errors: [error instanceof Error ? error.stack || error.message : 'Unknown error'],
      };

      status.lastResult = result;
      status.isRunning = false;

      console.error(`[Scheduler] Job ${name} failed:`, error);

      return result;
    }
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Job timeout')), timeoutMs)
      ),
    ]);
  }

  private parseSchedule(schedule: string): number {
    // Simplified schedule parsing for MVP
    // In production, use a proper cron parser

    const patterns: Record<string, number> = {
      '*/5 * * * *': 5 * 60 * 1000, // Every 5 minutes
      '*/10 * * * *': 10 * 60 * 1000, // Every 10 minutes
      '*/15 * * * *': 15 * 60 * 1000, // Every 15 minutes
      '*/30 * * * *': 30 * 60 * 1000, // Every 30 minutes
      '0 * * * *': 60 * 60 * 1000, // Every hour
      '0 */2 * * *': 2 * 60 * 60 * 1000, // Every 2 hours
      '0 */4 * * *': 4 * 60 * 60 * 1000, // Every 4 hours
      '0 3 * * *': 24 * 60 * 60 * 1000, // Daily at 3 AM (simplified to 24h interval)
    };

    return patterns[schedule] || 60 * 60 * 1000; // Default to 1 hour
  }

  /**
   * Stop all jobs
   */
  shutdown(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    console.log('[Scheduler] Shutdown complete');
  }
}

// Singleton instance
let schedulerInstance: SimpleJobScheduler | null = null;

export function getScheduler(): SimpleJobScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new SimpleJobScheduler();
  }
  return schedulerInstance;
}
