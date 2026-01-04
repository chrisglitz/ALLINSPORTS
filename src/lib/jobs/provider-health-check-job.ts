/**
 * Provider Health Check Job
 * Monitors the health of all data providers
 */

import { Job, JobConfig, JobResult, JobType } from './types';
import { getAdapterRegistry } from '../adapters/factory';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProviderHealthCheckJob implements Job {
  config: JobConfig = {
    type: JobType.PROVIDER_HEALTH_CHECK,
    name: 'Provider Health Check',
    description: 'Check health of all data providers',
    schedule: '*/5 * * * *', // Every 5 minutes
    timeout: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  };

  async execute(): Promise<JobResult> {
    const startTime = Date.now();

    try {
      const adapters = getAdapterRegistry();
      const checks = [
        { name: 'schedule', adapter: adapters.schedule },
        { name: 'stats', adapter: adapters.stats },
        { name: 'injuries', adapter: adapters.injuries },
        { name: 'odds', adapter: adapters.odds },
        { name: 'weather', adapter: adapters.weather },
        { name: 'news', adapter: adapters.news },
      ];

      let healthyCount = 0;

      for (const { name, adapter } of checks) {
        const healthResult = await adapter.healthCheck();
        const metadata = adapter.getMetadata();

        // Log health check result
        await prisma.providerHealthLog.create({
          data: {
            providerName: metadata.providerName,
            providerType: metadata.providerType,
            status: healthResult.status === 'healthy' ? 'SUCCESS' : 'ERROR',
            latencyMs: healthResult.latencyMs,
            errorMessage: healthResult.message,
          },
        });

        if (healthResult.status === 'healthy') {
          healthyCount++;
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `Health checks completed: ${healthyCount}/${checks.length} healthy`,
        duration,
        itemsProcessed: checks.length,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        errors: [error instanceof Error ? error.stack || error.message : 'Unknown error'],
      };
    }
  }
}
