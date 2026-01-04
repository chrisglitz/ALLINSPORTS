/**
 * Adapter Factory
 *
 * Constructs the appropriate adapter implementations based on configuration.
 * Supports switching between mock and real providers.
 */

import { AdapterConfig, AdapterRegistry } from './types';
import {
  MockScheduleAdapter,
  MockStatsAdapter,
  MockInjuriesAdapter,
  MockOddsAdapter,
  MockWeatherAdapter,
  MockNewsAdapter,
} from './mock';

// Real adapters would be imported here when implemented
// import { RealScheduleAdapter, RealStatsAdapter, ... } from './real';

export function createAdapterRegistry(config: AdapterConfig): AdapterRegistry {
  if (config.useMockData) {
    return {
      schedule: new MockScheduleAdapter(),
      stats: new MockStatsAdapter(),
      injuries: new MockInjuriesAdapter(),
      odds: new MockOddsAdapter(),
      weather: new MockWeatherAdapter(),
      news: new MockNewsAdapter(),
    };
  }

  // When real adapters are implemented:
  // return {
  //   schedule: new RealScheduleAdapter(config.providerApiKeys?.schedule),
  //   stats: new RealStatsAdapter(config.providerApiKeys?.stats),
  //   injuries: new RealInjuriesAdapter(config.providerApiKeys?.injuries),
  //   odds: new RealOddsAdapter(config.providerApiKeys?.odds),
  //   weather: new RealWeatherAdapter(config.providerApiKeys?.weather),
  //   news: new RealNewsAdapter(config.providerApiKeys?.news),
  // };

  throw new Error('Real adapters not yet implemented. Set USE_MOCK_DATA=true');
}

/**
 * Singleton registry instance
 */
let registryInstance: AdapterRegistry | null = null;

export function getAdapterRegistry(): AdapterRegistry {
  if (!registryInstance) {
    const config: AdapterConfig = {
      useMockData: process.env.USE_MOCK_DATA === 'true',
      providerApiKeys: {
        schedule: process.env.SCHEDULE_API_KEY,
        stats: process.env.STATS_API_KEY,
        injuries: process.env.INJURIES_API_KEY,
        odds: process.env.ODDS_API_KEY,
        weather: process.env.WEATHER_API_KEY,
        news: process.env.NEWS_API_KEY,
      },
    };

    registryInstance = createAdapterRegistry(config);
  }

  return registryInstance;
}

/**
 * Reset registry (useful for testing)
 */
export function resetAdapterRegistry(): void {
  registryInstance = null;
}
