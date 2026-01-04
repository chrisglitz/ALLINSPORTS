/**
 * Cache Service
 * Abstraction over Redis for caching
 */

import { Redis } from 'ioredis';

export class CacheService {
  private redis: Redis | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.REDIS_URL !== undefined;

    if (this.enabled && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('[Cache] Get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (seconds)
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('[Cache] Set error:', error);
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('[Cache] Delete error:', error);
    }
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('[Cache] Delete pattern error:', error);
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.enabled && this.redis !== null;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
