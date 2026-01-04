# NFL Forecasting MVP - Architecture & Data Flow

## System Overview

This is a pre-game NFL forecasting application that prioritizes **data freshness**, **transparency**, and **ethical practices**. The system fetches data from multiple providers through abstracted adapters, caches it intelligently, and runs a transparent prediction model that emphasizes explainability over black-box ML.

---

## Core Architecture Principles

### 1. Provider Abstraction Layer
- **Never hardcode vendor APIs**
- All data sources accessed through normalized adapter interfaces
- Easy to swap providers or add fallbacks
- Graceful degradation when providers fail

### 2. Data Freshness as First-Class Citizen
- Every data point has: `timestamp`, `source`, `freshness_status`
- Staleness thresholds configurable per data type
- UI prominently displays data age
- Model confidence degrades with stale data

### 3. Pre-Game Only
- No live odds tracking
- No in-game updates
- Game states: `scheduled` or `final` only
- Forecasts locked before kickoff

### 4. Transparent & Defensible Model
- No black-box ML models
- Clear factor weights
- External variables affect confidence/variance more than predictions
- All model runs logged with inputs + timestamps

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  Next.js App Router (TypeScript)                                │
│  - /nfl (games list)                                            │
│  - /nfl/[gameId] (matchup detail)                               │
│  - /admin (provider health, manual refresh)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  Next.js API Routes + Server Actions                            │
│  - /api/games                                                   │
│  - /api/games/[id]                                              │
│  - /api/refresh/[gameId]                                        │
│  - /api/admin/provider-health                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│  Business Logic                                                 │
│  - GameService                                                  │
│  - PredictionService                                            │
│  - DataFreshnessService                                         │
│  - ExternalFactorsService                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CACHE LAYER (REDIS)                        │
│  TTL-based caching                                              │
│  - Game data: 5 min TTL                                         │
│  - Odds: 10 min TTL (game day), 30 min otherwise                │
│  - Stats: 1 hour TTL                                            │
│  - Weather: 30 min TTL                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PROVIDER ADAPTER LAYER                        │
│  Normalized interfaces for all external data                   │
│  - ScheduleAdapter                                              │
│  - StatsAdapter                                                 │
│  - InjuryAdapter                                                │
│  - OddsAdapter                                                  │
│  - WeatherAdapter                                               │
│  - NewsAdapter                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER (POSTGRES)                   │
│  Prisma ORM                                                     │
│  - Normalized schema                                            │
│  - Historical snapshots                                         │
│  - Audit trail                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS                              │
│  Cron / Serverless Scheduler                                    │
│  - Sync schedule (daily)                                        │
│  - Sync stats (after games complete)                            │
│  - Sync injuries (hourly on game days, 4x daily otherwise)      │
│  - Sync odds (15 min on game days, hourly otherwise)            │
│  - Sync weather (hourly on game days)                           │
│  - Run predictions (after data sync)                            │
│  - Health checks (every 5 min)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Game Detail Page Request

```
1. USER requests /nfl/[gameId]
   │
   ├─> Next.js Page Component (Server Component)
   │
   ├─> GameService.getGameById(gameId)
   │    │
   │    ├─> Check Redis cache
   │    │    ├─> HIT: Return cached data
   │    │    └─> MISS:
   │    │         ├─> Query Postgres via Prisma
   │    │         ├─> Enrich with freshness metadata
   │    │         ├─> Store in Redis with TTL
   │    │         └─> Return
   │    │
   │    └─> DataFreshnessService.evaluateFreshness(data)
   │         ├─> Check each data type timestamp
   │         ├─> Apply staleness rules
   │         └─> Return freshness badges + warnings
   │
   ├─> PredictionService.getLatestPrediction(gameId)
   │    │
   │    ├─> Query model_runs table
   │    ├─> If stale or missing:
   │    │    ├─> Collect baseline inputs
   │    │    ├─> Collect external factors
   │    │    ├─> Run prediction model
   │    │    ├─> Calculate confidence score
   │    │    ├─> Store run in DB
   │    │    └─> Return
   │    │
   │    └─> Return prediction with metadata
   │
   └─> Render UI with:
        ├─> Data Freshness Panel
        ├─> Prediction + Confidence
        ├─> Odds comparison
        ├─> External factors breakdown
        └─> Model explanation
```

---

## Data Provider Adapter Flow

```
ADAPTER INTERFACE
┌─────────────────────────────────────────┐
│  interface BaseAdapter<T> {             │
│    fetch(params): Promise<T>            │
│    normalize(raw): NormalizedData       │
│    getMetadata(): ProviderMetadata      │
│  }                                      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  CONCRETE IMPLEMENTATIONS               │
│  - MockScheduleAdapter (dev/test)       │
│  - RealScheduleAdapter (production)     │
│                                         │
│  Each adapter:                          │
│  1. Fetches from provider               │
│  2. Handles errors gracefully           │
│  3. Normalizes to internal schema       │
│  4. Adds timestamp + source metadata    │
│  5. Logs health metrics                 │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  ADAPTER REGISTRY                       │
│  Configuration determines which         │
│  implementation to use per data type    │
│                                         │
│  env: USE_MOCK_DATA=true                │
│    → Uses mock adapters                 │
│  env: USE_MOCK_DATA=false               │
│    → Uses real adapters                 │
└─────────────────────────────────────────┘
```

---

## Prediction Model Architecture

```
INPUT LAYER (Baseline - Always On)
├─> Team Strength (ELO-like rating)
├─> Recent Form (last 5 games)
├─> Home Field Advantage
├─> Injuries Impact Score
├─> Weather Severity Score
├─> Rest & Travel Disadvantage
├─> Pace & Play Calling Metrics
└─> Referee Tendencies

        ▼

EXTERNAL FACTORS LAYER (Always On)
├─> Weather Impact
│   ├─> Wind speed/gusts
│   ├─> Precipitation probability
│   ├─> Temperature extremes
│   ├─> Dome vs outdoor
│   └─> → Weather Severity Score (0-100)
│
├─> Rest & Travel
│   ├─> Days of rest
│   ├─> Short week flag
│   ├─> Time zone change
│   ├─> Distance traveled
│   └─> → Scheduling Disadvantage Score (0-100)
│
├─> Referee Crew
│   ├─> Penalties per game
│   ├─> Home/away split
│   └─> → Affects variance
│
├─> Coaching Continuity
│   ├─> New HC/OC/DC flags
│   ├─> Weeks since change
│   └─> → Increases uncertainty early
│
├─> Pace & Play Calling
│   ├─> Situation-neutral pace
│   ├─> Early-down pass rate
│   └─> → Strong input for totals
│
├─> Trench Mismatch
│   ├─> O-line injuries
│   ├─> Pressure rate differential
│   └─> → Affects QB performance
│
└─> Kicker Reliability
    ├─> FG % by distance
    └─> Performance in adverse conditions

        ▼

OPTIONAL FACTORS LAYER (User Toggle Required)
├─> Social Media Signals (volume anomalies only)
├─> Market Disagreement
├─> Publicly Reported Personal Context
│
│   **CRITICAL RULE:**
│   These ONLY affect confidence/variance
│   NOT win probability or spread/total lean
│
└─> Stored with source, confidence, expiration

        ▼

PREDICTION ENGINE
├─> Calculate baseline prediction
├─> Apply external factors
├─> Calculate variance
├─> Determine confidence (1-5 scale)
│   ├─> Data freshness penalty
│   ├─> Model uncertainty
│   └─> Optional factors impact
│
└─> Output:
    ├─> Win Probability (0-100%)
    ├─> Projected Spread
    ├─> Projected Total
    ├─> Confidence Score (1-5)
    ├─> Edge vs Market (if > threshold)
    └─> Factor Breakdown (explainability)

        ▼

DECISION LOGIC
IF edge vs implied odds < threshold:
    → Display "No Bet / Low Edge"
ELSE:
    → Display prediction with confidence

        ▼

LOGGING
Store in model_runs table:
├─> All input values
├─> All timestamps used
├─> Model version
├─> Optional factors state
└─> Output values
```

---

## Data Freshness Rules Engine

```
┌─────────────────────────────────────────────────────────────────┐
│  FRESHNESS EVALUATION                                           │
│                                                                 │
│  For each data type, evaluate:                                 │
│  1. Current timestamp                                           │
│  2. Data timestamp                                              │
│  3. Game state (scheduled vs final)                             │
│  4. Days until game                                             │
│  5. Staleness threshold                                         │
│                                                                 │
│  STATUS = calculateStatus(age, threshold, context)              │
│  ├─> FRESH:  age < threshold * 0.5                              │
│  ├─> AGING:  age < threshold                                    │
│  └─> STALE:  age >= threshold                                   │
└─────────────────────────────────────────────────────────────────┘

THRESHOLDS (Configurable)
├─> Odds
│   ├─> Game Day: stale if > 15 minutes old
│   └─> Otherwise: stale if > 60 minutes old
│
├─> Injuries
│   ├─> Game Day: must be updated today
│   └─> Otherwise: stale if > 48 hours old
│
├─> Weather
│   ├─> Game Day: stale if > 60 minutes old
│   └─> Otherwise: stale if > 4 hours old
│
├─> Stats
│   ├─> Must be from current season
│   └─> Must be synced after last completed game
│
└─> Schedule
    └─> Stale if > 24 hours old

IMPACT ON MODEL
├─> FRESH data: confidence unchanged
├─> AGING data: confidence reduced 10%
└─> STALE data: confidence reduced 30% + warning banner
```

---

## Caching Strategy (Detailed)

```
REDIS CACHE STRUCTURE

Key Pattern: {dataType}:{identifier}:{version}

Examples:
├─> game:nfl_2026_w1_buf_kc:v1
├─> odds:nfl_2026_w1_buf_kc:v1
├─> weather:arrowhead_stadium:2026-01-04T13:00:00Z
├─> injuries:kc_chiefs:2026-01-04
└─> stats:kc_chiefs:2025_season

TTL STRATEGY
├─> Game metadata: 5 minutes
├─> Odds
│   ├─> Game day: 5 minutes
│   └─> Otherwise: 30 minutes
├─> Injuries
│   ├─> Game day: 15 minutes
│   └─> Otherwise: 1 hour
├─> Weather: 30 minutes
├─> Stats: 1 hour
├─> Predictions: 10 minutes
└─> Provider health: 5 minutes

CACHE INVALIDATION
├─> Background job completion → invalidate related keys
├─> Manual refresh endpoint → invalidate specific game
├─> Webhook from provider (if available) → invalidate
└─> TTL expiration → natural invalidation

CACHE-ASIDE PATTERN
1. Check cache
2. If miss → fetch from DB
3. If DB miss → fetch from provider
4. Store in DB
5. Store in cache with TTL
6. Return to client

CACHE WARMING
├─> Pre-load upcoming games (next 7 days)
├─> Pre-compute predictions for today's games
└─> Triggered by background job scheduler
```

---

## Background Job Definitions

```
JOB: Sync Schedule
├─> Frequency: Daily at 3:00 AM ET
├─> Action:
│   ├─> Fetch schedule for current + next week
│   ├─> Upsert games in DB
│   ├─> Log provider health
│   └─> Invalidate cache
└─> Timeout: 5 minutes

JOB: Sync Team Stats
├─> Frequency: After games complete (check hourly)
├─> Action:
│   ├─> Identify completed games without stats
│   ├─> Fetch team stats via adapter
│   ├─> Store in team_game_stats
│   ├─> Update team aggregates
│   ├─> Log provider health
│   └─> Invalidate cache
└─> Timeout: 10 minutes

JOB: Sync Injuries
├─> Frequency:
│   ├─> Game day: Every 30 minutes
│   └─> Otherwise: Every 4 hours
├─> Action:
│   ├─> Fetch injury reports for all teams
│   ├─> Upsert injuries table
│   ├─> Mark resolved injuries
│   ├─> Calculate impact scores
│   ├─> Log provider health
│   └─> Invalidate cache
└─> Timeout: 5 minutes

JOB: Sync Odds
├─> Frequency:
│   ├─> Game day: Every 10 minutes
│   └─> Otherwise: Every 30 minutes
├─> Action:
│   ├─> Fetch odds for upcoming games
│   ├─> Store snapshot in odds_snapshots
│   ├─> Calculate best available odds
│   ├─> Log provider health
│   └─> Invalidate cache
└─> Timeout: 5 minutes

JOB: Sync Weather
├─> Frequency:
│   ├─> Game day: Every 30 minutes
│   └─> Otherwise: Every 2 hours
├─> Action:
│   ├─> Fetch hourly forecast for outdoor venues
│   ├─> Store in weather_snapshots
│   ├─> Calculate severity scores
│   ├─> Log provider health
│   └─> Invalidate cache
└─> Timeout: 3 minutes

JOB: Run Predictions
├─> Frequency: After data sync (or every 15 min on game day)
├─> Action:
│   ├─> Identify games needing predictions
│   ├─> Collect all inputs
│   ├─> Run prediction model
│   ├─> Calculate confidence
│   ├─> Store in model_runs
│   └─> Invalidate prediction cache
└─> Timeout: 5 minutes

JOB: Provider Health Check
├─> Frequency: Every 5 minutes
├─> Action:
│   ├─> Ping each adapter
│   ├─> Measure latency
│   ├─> Store in provider_health_logs
│   └─> Alert if failures exceed threshold
└─> Timeout: 2 minutes

JOB: Cleanup Old Data
├─> Frequency: Daily at 2:00 AM ET
├─> Action:
│   ├─> Archive completed games > 30 days old
│   ├─> Delete stale cache entries
│   └─> Vacuum database
└─> Timeout: 10 minutes
```

---

## Error Handling & Resilience

```
PROVIDER FAILURE HANDLING
├─> Timeout after 10 seconds
├─> Retry with exponential backoff (3 attempts)
├─> Log failure in provider_health_logs
├─> Return cached data if available
├─> Display warning to user
└─> Degrade confidence score

CACHE FAILURE HANDLING
├─> Log error
├─> Fall back to database
└─> Continue operation

DATABASE FAILURE HANDLING
├─> Log critical error
├─> Return cached data if available
├─> Display error message to user
└─> Alert operations team

STALE DATA HANDLING
├─> Never silently show stale data
├─> Display staleness warning
├─> Reduce model confidence
└─> Offer manual refresh option

MODEL FAILURE HANDLING
├─> Log error with all inputs
├─> Return null prediction
├─> Display "Prediction Unavailable"
└─> Show raw inputs to user
```

---

## Security & Ethics

```
API RATE LIMITING
├─> User-facing endpoints: 100 req/min per IP
├─> Admin endpoints: Require authentication
└─> Provider adapters: Respect vendor rate limits

RESPONSIBLE GAMBLING
├─> Prominent disclaimer on all pages
├─> No live/in-game betting features
├─> No promotional language ("locks", "guaranteed")
└─> Educational focus on probability vs certainty

DATA SOURCING
├─> No web scraping
├─> Only licensed/free data providers
├─> Clear attribution in UI
└─> Respect robots.txt and ToS

PRIVACY
├─> No user tracking beyond analytics
├─> No PII collection
└─> Session data only for admin features

OPTIONAL FEATURES
├─> Social/rumor signals OFF by default
├─> User must explicitly enable
├─> Clear labeling of source confidence
└─> These signals ONLY affect variance, not predictions
```

---

## Deployment Architecture

```
PRODUCTION ENVIRONMENT
├─> Vercel (Next.js hosting)
├─> Supabase Postgres (or AWS RDS)
├─> Upstash Redis (or AWS ElastiCache)
├─> Vercel Cron (or AWS EventBridge)
└─> Environment variables for provider API keys

DEVELOPMENT ENVIRONMENT
├─> Local Next.js dev server
├─> Docker Compose:
│   ├─> Postgres container
│   └─> Redis container
├─> Mock provider adapters
└─> Seed data for testing

STAGING ENVIRONMENT
├─> Mirror of production
├─> Mix of mock + real providers
└─> Used for integration testing
```

---

## Next Steps

After this architecture document:
1. Design detailed refresh & caching strategy ✓ (covered above)
2. Define Prisma schema
3. Design provider adapter interfaces
4. Implement background job definitions
5. Design Next.js page + component structure
6. Build mock provider implementations
7. Create seed script
8. Write comprehensive README

This architecture ensures:
- **Data freshness is transparent and enforced**
- **Provider abstraction enables flexibility**
- **Pre-game focus is maintained**
- **Model is explainable and defensible**
- **System is resilient and ethical**
