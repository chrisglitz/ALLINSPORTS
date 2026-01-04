/**
 * Background Job Type Definitions
 *
 * Defines the structure and scheduling for all background jobs
 */

export enum JobType {
  SYNC_SCHEDULE = 'SYNC_SCHEDULE',
  SYNC_STATS = 'SYNC_STATS',
  SYNC_INJURIES = 'SYNC_INJURIES',
  SYNC_ODDS = 'SYNC_ODDS',
  SYNC_WEATHER = 'SYNC_WEATHER',
  SYNC_NEWS = 'SYNC_NEWS',
  RUN_PREDICTIONS = 'RUN_PREDICTIONS',
  PROVIDER_HEALTH_CHECK = 'PROVIDER_HEALTH_CHECK',
  CLEANUP_OLD_DATA = 'CLEANUP_OLD_DATA',
}

export interface JobConfig {
  type: JobType;
  name: string;
  description: string;
  schedule: string; // Cron expression
  timeout: number; // milliseconds
  enabled: boolean;
}

export interface JobResult {
  success: boolean;
  message: string;
  duration: number; // milliseconds
  itemsProcessed?: number;
  errors?: string[];
}

export interface Job {
  config: JobConfig;
  execute(): Promise<JobResult>;
}

/**
 * Job execution context
 */
export interface JobContext {
  startTime: Date;
  jobId: string;
  attempt: number;
}

/**
 * Job scheduler interface
 */
export interface JobScheduler {
  register(job: Job): void;
  unregister(jobType: JobType): void;
  trigger(jobType: JobType): Promise<JobResult>;
  getStatus(): JobStatus[];
}

export interface JobStatus {
  type: JobType;
  name: string;
  lastRun?: Date;
  lastResult?: JobResult;
  nextRun?: Date;
  isRunning: boolean;
}
