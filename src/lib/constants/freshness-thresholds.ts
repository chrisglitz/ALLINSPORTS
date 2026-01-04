/**
 * Data Freshness Thresholds (in minutes)
 * Configurable staleness rules per data type
 */

export const FRESHNESS_THRESHOLDS = {
  odds: {
    gameDay: 15, // Stale if > 15 minutes on game day
    otherwise: 60, // Stale if > 60 minutes otherwise
  },
  injuries: {
    gameDay: 60 * 24, // Stale if not updated today on game day
    otherwise: 60 * 48, // Stale if > 48 hours otherwise
  },
  weather: {
    gameDay: 60, // Stale if > 60 minutes on game day
    otherwise: 60 * 4, // Stale if > 4 hours otherwise
  },
  stats: 60 * 24 * 7, // Stale if > 1 week (should be synced after games)
  schedule: 60 * 24, // Stale if > 24 hours
} as const;
