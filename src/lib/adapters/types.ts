/**
 * Provider Adapter Type Definitions
 *
 * All data providers must implement these interfaces to ensure:
 * - Consistent data structure
 * - Timestamp tracking
 * - Source attribution
 * - Graceful error handling
 */

// ============================================================================
// BASE ADAPTER INTERFACE
// ============================================================================

export interface ProviderMetadata {
  providerName: string;
  providerType: ProviderType;
  version: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}

export enum ProviderType {
  SCHEDULE = 'SCHEDULE',
  STATS = 'STATS',
  INJURIES = 'INJURIES',
  ODDS = 'ODDS',
  WEATHER = 'WEATHER',
  NEWS = 'NEWS',
}

export interface AdapterResponse<T> {
  data: T;
  metadata: {
    source: string;
    fetchedAt: Date;
    dataTimestamp?: Date; // When the data was originally produced (if different from fetch time)
  };
}

export interface BaseAdapter<TParams, TResponse> {
  /**
   * Fetch data from the provider
   */
  fetch(params: TParams): Promise<AdapterResponse<TResponse>>;

  /**
   * Get provider metadata
   */
  getMetadata(): ProviderMetadata;

  /**
   * Health check - verify provider is accessible
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs?: number;
    message?: string;
  }>;
}

// ============================================================================
// SCHEDULE ADAPTER
// ============================================================================

export interface ScheduleGame {
  externalId?: string;
  homeTeam: {
    name: string;
    abbreviation: string;
    externalId?: string;
  };
  awayTeam: {
    name: string;
    abbreviation: string;
    externalId?: string;
  };
  venue?: {
    name: string;
    city: string;
    state?: string;
    isDome: boolean;
  };
  scheduledTime: Date;
  week: number;
  seasonType: 'PRE' | 'REG' | 'POST';
  season: number;
  status: 'scheduled' | 'final' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
}

export interface FetchScheduleParams {
  season: number;
  week?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ScheduleAdapter extends BaseAdapter<FetchScheduleParams, ScheduleGame[]> {}

// ============================================================================
// STATS ADAPTER
// ============================================================================

export interface TeamStats {
  teamId: string; // External team ID
  teamName: string;
  // Offense
  totalYards?: number;
  passingYards?: number;
  rushingYards?: number;
  turnovers?: number;
  passCompletions?: number;
  passAttempts?: number;
  rushAttempts?: number;
  timeOfPossession?: number; // seconds
  thirdDownConversions?: number;
  thirdDownAttempts?: number;
  redZoneAttempts?: number;
  redZoneScores?: number;
  // Defense
  sacks?: number;
  tacklesForLoss?: number;
  qbHits?: number;
  passesDefended?: number;
  // Special Teams
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
}

export interface PlayerStats {
  playerId: string; // External player ID
  playerName: string;
  position: string;
  // Passing
  passYards?: number;
  passTDs?: number;
  interceptions?: number;
  passAttempts?: number;
  passCompletions?: number;
  // Rushing
  rushYards?: number;
  rushTDs?: number;
  rushAttempts?: number;
  // Receiving
  receptions?: number;
  recYards?: number;
  recTDs?: number;
  targets?: number;
}

export interface GameStats {
  gameId: string;
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
  playerStats: PlayerStats[];
}

export interface FetchStatsParams {
  gameId?: string;
  teamId?: string;
  season: number;
  week?: number;
}

export interface StatsAdapter extends BaseAdapter<FetchStatsParams, GameStats[]> {}

// ============================================================================
// INJURIES ADAPTER
// ============================================================================

export interface InjuryReport {
  playerId?: string;
  playerName: string;
  teamId?: string;
  teamName: string;
  position: string;
  description: string; // "Knee injury"
  designation: 'OUT' | 'QUESTIONABLE' | 'DOUBTFUL' | 'PROBABLE' | 'IR';
  reportedDate: Date;
  estimatedReturn?: Date;
}

export interface FetchInjuriesParams {
  teamId?: string;
  season: number;
  week?: number;
}

export interface InjuriesAdapter extends BaseAdapter<FetchInjuriesParams, InjuryReport[]> {}

// ============================================================================
// ODDS ADAPTER
// ============================================================================

export interface OddsLine {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  // Moneyline
  homeMoneyline?: number;
  awayMoneyline?: number;
  // Spread
  homeSpread?: number;
  homeSpreadOdds?: number; // e.g., -110
  awaySpread?: number;
  awaySpreadOdds?: number;
  // Total
  overUnder?: number;
  overOdds?: number;
  underOdds?: number;
  // Metadata
  bookmaker: string;
  lastUpdate?: Date;
}

export interface PlayerProp {
  playerId?: string;
  playerName: string;
  propType: string; // "PassingYards", "RushingYards", "TDs"
  line: number;
  overOdds?: number;
  underOdds?: number;
  bookmaker: string;
}

export interface FetchOddsParams {
  gameId?: string;
  sport: string;
  season: number;
  startDate?: Date;
  endDate?: Date;
}

export interface OddsAdapter extends BaseAdapter<FetchOddsParams, OddsLine[]> {}

// ============================================================================
// WEATHER ADAPTER
// ============================================================================

export interface WeatherForecast {
  venueId?: string;
  venueName: string;
  latitude: number;
  longitude: number;
  forecastTime: Date; // When this forecast is for
  issuedAt: Date; // When this forecast was issued
  temperature?: number; // Fahrenheit
  feelsLike?: number;
  windSpeed?: number; // mph
  windGust?: number;
  windDirection?: string; // "NW", "SE", etc.
  precipProbability?: number; // 0-100
  precipType?: 'rain' | 'snow' | 'sleet' | 'none';
  humidity?: number; // 0-100
  condition?: string; // "Clear", "Cloudy", "Rain", "Snow"
  visibility?: number; // miles
}

export interface FetchWeatherParams {
  latitude: number;
  longitude: number;
  forecastTime: Date;
}

export interface WeatherAdapter extends BaseAdapter<FetchWeatherParams, WeatherForecast[]> {}

// ============================================================================
// NEWS ADAPTER
// ============================================================================

export interface NewsArticle {
  id?: string;
  headline: string;
  snippet?: string;
  sourceUrl?: string;
  sourceName: string;
  publishedAt: Date;
  teamIds?: string[];
  playerIds?: string[];
  sentiment?: {
    score: number; // -1 to 1
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  relevanceScore?: number; // 0-100
  expiresAt?: Date;
}

export interface FetchNewsParams {
  teamId?: string;
  playerId?: string;
  gameId?: string;
  keywords?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface NewsAdapter extends BaseAdapter<FetchNewsParams, NewsArticle[]> {}

// ============================================================================
// ADAPTER REGISTRY
// ============================================================================

export interface AdapterRegistry {
  schedule: ScheduleAdapter;
  stats: StatsAdapter;
  injuries: InjuriesAdapter;
  odds: OddsAdapter;
  weather: WeatherAdapter;
  news: NewsAdapter;
}

// ============================================================================
// ADAPTER FACTORY
// ============================================================================

export interface AdapterConfig {
  useMockData: boolean;
  providerApiKeys?: {
    schedule?: string;
    stats?: string;
    injuries?: string;
    odds?: string;
    weather?: string;
    news?: string;
  };
}

export type AdapterFactory = (config: AdapterConfig) => AdapterRegistry;
