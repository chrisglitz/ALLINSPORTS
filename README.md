# 🏈 NFL Forecasting MVP

A transparent, data-driven sports forecasting web application focused on **PRE-GAME NFL predictions** with an emphasis on **data freshness**, **explainability**, and **ethical practices**.

---

## ⚠️ IMPORTANT DISCLAIMER

**THIS APPLICATION IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.**

- **NOT BETTING ADVICE**: Predictions and recommendations are algorithmic outputs, not professional betting advice.
- **NO GUARANTEES**: Past performance does not guarantee future results. All predictions carry inherent uncertainty.
- **RESPONSIBLE GAMBLING**: If you choose to bet, do so responsibly. Never wager more than you can afford to lose.
- **LEGAL COMPLIANCE**: Ensure sports betting is legal in your jurisdiction before engaging.
- **SEEK HELP**: If gambling becomes a problem, contact the National Problem Gambling Helpline at 1-800-522-4700.

---

## 🎯 Core Principles

### 1. Data Relevance > Data Volume
- Every stat, injury report, odds line, weather forecast, and signal includes:
  - **Source**: Where the data came from
  - **Timestamp**: When it was fetched
  - **Freshness Status**: FRESH / AGING / STALE
- Stale data is never shown as current—warnings are displayed prominently

### 2. Pre-Game Only
- No live odds tracking
- No in-game win probability updates
- Game statuses: `scheduled` or `final` only

### 3. Explainable & Defensible Model
- No black-box machine learning
- Clear factor weights and contributions
- External variables (weather, rest, referee tendencies) influence **variance and confidence** more than predictions

### 4. Safe & Ethical
- No web scraping
- No rumors without sourcing
- No speculative personal analysis unless explicitly enabled
- Prominent disclaimer on all pages

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis (optional)
- **Styling**: Tailwind CSS

### System Components

```
┌─────────────────────────────────────────┐
│         Client (Next.js App)            │
│  - /nfl (games list)                    │
│  - /nfl/[gameId] (matchup detail)       │
│  - /admin (provider health)             │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│      Service Layer                      │
│  - GameService                          │
│  - PredictionService                    │
│  - FreshnessService                     │
│  - CacheService                         │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│      Provider Adapter Layer             │
│  - ScheduleAdapter                      │
│  - StatsAdapter                         │
│  - InjuriesAdapter                      │
│  - OddsAdapter                          │
│  - WeatherAdapter                       │
│  - NewsAdapter                          │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│     Data Layer (Postgres + Redis)       │
└─────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ and npm
- **Docker** & Docker Compose (recommended for local database)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ALLINSPORTS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local database (Docker)**
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL on port 5432 and Redis on port 6379.

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:
   ```env
   DATABASE_URL="postgresql://allinsports:development@localhost:5432/allinsports?schema=public"
   REDIS_URL="redis://localhost:6379"
   USE_MOCK_DATA=true
   ```

5. **Initialize database**
   ```bash
   npm run db:push       # Create tables
   npm run db:seed       # Populate sample data
   ```

6. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
ALLINSPORTS/
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── nfl/
│   │   │   ├── page.tsx      # Games list
│   │   │   └── [gameId]/
│   │   │       └── page.tsx  # Game detail
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── games/
│   │       └── refresh/
│   ├── components/           # React components
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── games/
│   │   ├── matchup/
│   │   └── admin/
│   ├── lib/
│   │   ├── adapters/         # Data provider abstractions
│   │   │   ├── types.ts
│   │   │   ├── base-adapter.ts
│   │   │   ├── factory.ts
│   │   │   └── mock/         # Mock implementations
│   │   ├── services/         # Business logic
│   │   │   ├── game-service.ts
│   │   │   ├── prediction-service.ts
│   │   │   ├── freshness-service.ts
│   │   │   └── cache-service.ts
│   │   ├── jobs/             # Background jobs
│   │   │   ├── scheduler.ts
│   │   │   ├── sync-schedule-job.ts
│   │   │   ├── sync-odds-job.ts
│   │   │   └── ...
│   │   ├── utils/
│   │   └── constants/
│   └── types/
├── ARCHITECTURE.md           # Detailed architecture docs
├── NEXT_JS_STRUCTURE.md      # Component structure guide
├── docker-compose.yml        # Local dev environment
├── package.json
├── tsconfig.json
└── README.md (this file)
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset DB and re-seed

# Background Jobs
npm run jobs:start       # Start background job scheduler

# Linting & Type Checking
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
```

---

## 📊 Data Freshness Rules

Every data type has configurable staleness thresholds:

| Data Type | Game Day Threshold | Otherwise | Impact if Stale |
|-----------|-------------------|-----------|-----------------|
| **Odds** | 15 minutes | 60 minutes | -30% confidence |
| **Injuries** | Updated today | 48 hours | -30% confidence |
| **Weather** | 60 minutes | 4 hours | -10% confidence |
| **Stats** | After last game | 1 week | -20% confidence |

**Staleness Status:**
- **FRESH**: Age < 50% of threshold (green badge)
- **AGING**: Age < 100% of threshold (yellow badge)
- **STALE**: Age >= threshold (red badge + warning)

---

## 🧠 Prediction Model

### Baseline Inputs (Always On)
- **Team Strength**: ELO-like rating system
- **Recent Form**: Last 5 games performance
- **Home Field Advantage**: +2.5 point baseline
- **Injuries**: Impact score based on player importance
- **Weather**: Severity score for outdoor games
- **Rest & Travel**: Days of rest, time zone changes
- **Pace**: Situation-neutral offensive pace
- **Referee Tendencies**: Penalty rates, home favoritism

### External Factors (Always On)
1. **Weather Impact** (0-100 score)
   - Wind speed/gusts
   - Precipitation probability
   - Temperature extremes
   - Dome vs outdoor

2. **Rest & Travel** (0-100 score)
   - Days of rest
   - Short week flag
   - Time zone changes
   - Distance traveled

3. **Referee Crew**
   - Penalties per game
   - Home/away split
   - Impact on totals

4. **Coaching Continuity**
   - New HC/OC/DC flags
   - Increases uncertainty early

5. **Pace & Play Calling**
   - Strong input for totals & props

6. **Trench Mismatch**
   - O-line injuries
   - Pressure rate differential

7. **Kicker Reliability**
   - FG % by distance
   - Weather performance

### Optional Factors (User-Controlled, OFF by Default)
- Social media signal (volume anomalies)
- Market disagreement
- Publicly reported personal context

**Rules:**
- Optional factors **ONLY** affect confidence/variance
- They **NEVER** change win probability or spread/total lean
- Must be explicitly enabled by user
- Require source, confidence label, and expiration timestamp

### Model Outputs
- **Win Probability**: 0-100%
- **Projected Spread**: Home team perspective
- **Projected Total**: Over/under
- **Confidence Score**: 1-5 stars
- **Edge vs Market**: Difference from best available odds
- **Recommendation**: BET_HOME | BET_AWAY | NO_BET

**No Bet Threshold:**
If edge vs implied odds < 2.0 points, display "No Bet / Low Edge"

---

## 🔄 Background Jobs

Jobs run automatically via scheduler (or Vercel Cron in production):

| Job | Frequency | Timeout | Purpose |
|-----|-----------|---------|---------|
| **Sync Schedule** | Daily at 3 AM | 5 min | Fetch upcoming games |
| **Sync Stats** | Hourly | 10 min | Fetch completed game stats |
| **Sync Injuries** | 30 min (game day), 4h otherwise | 5 min | Update injury reports |
| **Sync Odds** | 15 min (game day), 30 min otherwise | 5 min | Store odds snapshots |
| **Sync Weather** | 30 min (game day), 2h otherwise | 3 min | Forecast for outdoor venues |
| **Run Predictions** | 15 min (game day) | 5 min | Generate forecasts |
| **Provider Health** | Every 5 min | 2 min | Monitor data sources |
| **Cleanup** | Daily at 2 AM | 10 min | Archive old data |

---

## 🎨 User Interface

### Games List (`/nfl`)
- Date selector (prev/next, date picker)
- Game cards showing:
  - Teams & kickoff time
  - Best available odds
  - Freshness badges
  - Weather/injury indicators
- Responsive grid (3 cols → 2 cols → 1 col)

### Game Detail (`/nfl/[gameId]`)
- **Data Freshness Panel** (top of page)
  - Shows age of odds, injuries, weather, stats
  - Warning banner if any data is stale

- **Tabs:**
  - **Overview**: Prediction + best odds + key factors
  - **Odds**: Multi-book comparison
  - **Team Stats**: Season stats + recent form
  - **Player Props**: Passing/rushing/receiving (if available)
  - **Injuries**: Current reports + impact scores
  - **Weather**: Hourly forecast + severity
  - **External Factors**: Rest, referee, pace, etc.
  - **Model Explanation**: Factor contributions + confidence breakdown

### Admin Dashboard (`/admin`)
- Provider health table
- Job status list
- Manual refresh controls

---

## 🧪 Testing & Development

### Mock Data Mode
Set `USE_MOCK_DATA=true` in `.env` to use mock adapters.

Mock adapters generate realistic test data without external API calls:
- Schedule: 8 games per week
- Stats: Random but realistic
- Injuries: 0-5 per team
- Odds: Multiple bookmakers
- Weather: Season-appropriate forecasts
- News: Sample headlines

### Provider Health Logging
All adapter calls are logged to `provider_health_logs` table:
- Provider name
- Status (SUCCESS/TIMEOUT/ERROR)
- Latency (ms)
- Error message (if failed)

View health at `/admin/providers`

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables:
   ```
   DATABASE_URL=<your-postgres-url>
   REDIS_URL=<your-redis-url>
   USE_MOCK_DATA=false
   SCHEDULE_API_KEY=<your-key>
   ODDS_API_KEY=<your-key>
   # ... etc
   ```
4. Configure Vercel Cron jobs in `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/sync-schedule",
         "schedule": "0 3 * * *"
       },
       {
         "path": "/api/cron/sync-odds",
         "schedule": "*/15 * * * *"
       }
     ]
   }
   ```

### Database Providers
- **Supabase**: Free tier includes Postgres + Redis
- **Neon**: Serverless Postgres
- **Railway**: Full-stack deployment
- **AWS RDS**: Production-grade Postgres

---

## 📝 Adding Real Data Providers

To replace mock adapters with real providers:

1. **Create adapter implementation**
   ```typescript
   // src/lib/adapters/real/real-odds-adapter.ts
   export class RealOddsAdapter extends AbstractBaseAdapter<FetchOddsParams, OddsLine[]> {
     constructor(apiKey: string) {
       super({
         providerName: 'RealOddsProvider',
         providerType: ProviderType.ODDS,
         version: '1.0.0',
       });
       this.apiKey = apiKey;
     }

     async fetch(params: FetchOddsParams) {
       // Implement API call
       const response = await fetchFromProvider(this.apiKey, params);
       const normalized = this.normalize(response);
       return this.createResponse(normalized);
     }

     protected async performHealthCheck() {
       // Lightweight check
     }
   }
   ```

2. **Update factory**
   ```typescript
   // src/lib/adapters/factory.ts
   import { RealOddsAdapter } from './real/real-odds-adapter';

   export function createAdapterRegistry(config: AdapterConfig) {
     if (config.useMockData) {
       return { /* mock adapters */ };
     }

     return {
       odds: new RealOddsAdapter(config.providerApiKeys.odds),
       // ... other adapters
     };
   }
   ```

3. **Set environment variables**
   ```env
   USE_MOCK_DATA=false
   ODDS_API_KEY=your-real-api-key
   ```

4. **Test thoroughly**
   ```bash
   npm run db:reset
   npm run dev
   # Verify data is fetching correctly
   ```

---

## 🔐 Security Best Practices

### API Keys
- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Use different keys for dev/prod

### Rate Limiting
- Respect provider rate limits (defined in adapter metadata)
- Implement exponential backoff on failures
- Cache aggressively to minimize calls

### Input Validation
- Sanitize all user inputs
- Validate date ranges
- Prevent SQL injection (Prisma handles this)

### CORS
- Restrict API access to your domain in production
- Use Next.js middleware for API route protection

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if Postgres is running
docker ps

# Restart containers
docker-compose restart

# Check connection
psql $DATABASE_URL
```

### Prisma Client Not Generated
```bash
npm run db:generate
```

### Redis Not Available
Redis is optional. If `REDIS_URL` is not set, caching is disabled (app still works).

### Jobs Not Running
Jobs use in-process scheduler in development. In production, use Vercel Cron or AWS EventBridge.

### Type Errors
```bash
npm run type-check
```

---

## 📚 Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **Component Structure**: See `NEXT_JS_STRUCTURE.md`
- **Prisma Schema**: See `prisma/schema.prisma`
- **Adapter Interfaces**: See `src/lib/adapters/types.ts`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Code Style:**
- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments for public APIs
- Test with mock data before submitting

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Data Providers**: This app is designed to work with ethical, licensed data providers
- **Community**: Built with transparency and responsible gambling in mind
- **Inspiration**: Sports analytics community and open-source ecosystem

---

## ⚖️ Legal

**Disclaimer**: This application provides algorithmic predictions for informational purposes only. It is not professional betting advice. The creators and maintainers are not responsible for any financial losses incurred from using this application.

**Responsible Gambling**: If you or someone you know has a gambling problem, please seek help:
- National Problem Gambling Helpline: **1-800-522-4700**
- Website: [ncpgambling.org](https://www.ncpgambling.org)

**Verify Legality**: Sports betting laws vary by jurisdiction. Ensure compliance with local laws before engaging in any betting activity.

---

**Built with ❤️ for transparent, ethical sports forecasting.**
