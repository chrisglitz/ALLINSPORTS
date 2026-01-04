/**
 * Base Adapter Implementation
 * Provides common functionality for all adapters
 */

import { BaseAdapter, ProviderMetadata, AdapterResponse } from './types';

export abstract class AbstractBaseAdapter<TParams, TResponse> implements BaseAdapter<TParams, TResponse> {
  protected metadata: ProviderMetadata;

  constructor(metadata: ProviderMetadata) {
    this.metadata = metadata;
  }

  abstract fetch(params: TParams): Promise<AdapterResponse<TResponse>>;

  getMetadata(): ProviderMetadata {
    return this.metadata;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs?: number;
    message?: string;
  }> {
    const startTime = Date.now();

    try {
      // Attempt a lightweight fetch operation
      await this.performHealthCheck();
      const latencyMs = Date.now() - startTime;

      return {
        status: latencyMs < 2000 ? 'healthy' : 'degraded',
        latencyMs,
        message: latencyMs < 2000 ? 'Provider is healthy' : 'Provider is slow',
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        status: 'unhealthy',
        latencyMs,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Override this method to perform a lightweight health check
   */
  protected abstract performHealthCheck(): Promise<void>;

  /**
   * Utility: Retry with exponential backoff
   */
  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    initialDelayMs = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < maxRetries - 1) {
          const delayMs = initialDelayMs * Math.pow(2, attempt);
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError;
  }

  /**
   * Utility: Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Utility: Create standardized response
   */
  protected createResponse<T>(
    data: T,
    dataTimestamp?: Date
  ): AdapterResponse<T> {
    return {
      data,
      metadata: {
        source: this.metadata.providerName,
        fetchedAt: new Date(),
        dataTimestamp,
      },
    };
  }

  /**
   * Utility: Handle errors gracefully
   */
  protected handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`[${this.metadata.providerName}] ${context}: ${errorMessage}`);
  }
}
