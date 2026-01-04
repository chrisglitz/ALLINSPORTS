# Next.js Page & Component Structure

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with disclaimer
│   ├── page.tsx                  # Home page (redirects to /nfl)
│   ├── nfl/
│   │   ├── page.tsx              # NFL games list
│   │   ├── [gameId]/
│   │   │   └── page.tsx          # Game detail page
│   │   └── layout.tsx            # NFL layout with navigation
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── providers/
│   │   │   └── page.tsx          # Provider health monitoring
│   │   └── refresh/
│   │       └── page.tsx          # Manual refresh controls
│   └── api/
│       ├── games/
│       │   ├── route.ts          # GET /api/games
│       │   └── [id]/
│       │       └── route.ts      # GET /api/games/:id
│       ├── refresh/
│       │   └── [gameId]/
│       │       └── route.ts      # POST /api/refresh/:gameId
│       └── admin/
│           ├── providers/
│           │   └── route.ts      # GET /api/admin/providers
│           └── jobs/
│               └── route.ts      # GET /api/admin/jobs
│
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   └── skeleton.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── disclaimer-banner.tsx
│   ├── games/
│   │   ├── game-card.tsx         # Game summary card
│   │   ├── game-list.tsx         # List of games
│   │   └── date-selector.tsx    # Date navigation
│   ├── matchup/
│   │   ├── data-freshness-panel.tsx
│   │   ├── prediction-display.tsx
│   │   ├── odds-comparison.tsx
│   │   ├── team-stats-table.tsx
│   │   ├── injuries-list.tsx
│   │   ├── weather-display.tsx
│   │   ├── external-factors.tsx
│   │   └── model-explanation.tsx
│   └── admin/
│       ├── provider-health-table.tsx
│       ├── job-status-list.tsx
│       └── manual-refresh-form.tsx
│
├── lib/                          # Business logic
│   ├── adapters/                 # Data provider adapters (already created)
│   ├── jobs/                     # Background jobs (already created)
│   ├── services/
│   │   ├── game-service.ts       # Game data operations
│   │   ├── prediction-service.ts # Prediction model
│   │   ├── freshness-service.ts  # Data freshness checks
│   │   ├── external-factors-service.ts
│   │   └── cache-service.ts      # Redis caching
│   ├── utils/
│   │   ├── odds-utils.ts         # Odds conversion & formatting
│   │   ├── date-utils.ts         # Date formatting
│   │   └── validation.ts         # Input validation
│   └── constants/
│       └── freshness-thresholds.ts
│
└── types/                        # TypeScript types
    ├── game.ts
    ├── prediction.ts
    └── freshness.ts
```

---

## Page Implementations

### `/nfl` - NFL Games List

**Purpose:** Display all NFL games for a selected date

**Data Fetched:**
- Games for selected date
- Latest odds snapshot for each game
- Injury count per team
- Weather severity (if outdoor venue)

**UI Elements:**
- Date selector (prev/next buttons, date picker)
- Game cards grid:
  - Away @ Home
  - Kickoff time
  - Best odds (moneyline, spread, total)
  - Freshness badges (green/yellow/red)
  - Weather icon (if severe)
  - Injury icon (if key players out)
- "No games scheduled" message if empty

**Example:**
```tsx
// src/app/nfl/page.tsx
import { GameList } from '@/components/games/game-list';
import { DateSelector } from '@/components/games/date-selector';

export default async function NFLGamesPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const selectedDate = searchParams.date
    ? new Date(searchParams.date)
    : new Date();

  // Fetch games from service
  const games = await getGamesForDate(selectedDate);

  return (
    <div>
      <DateSelector selectedDate={selectedDate} />
      <GameList games={games} />
    </div>
  );
}
```

---

### `/nfl/[gameId]` - Game Detail Page

**Purpose:** Display comprehensive matchup analysis with data freshness

**Sections:**

1. **Header**
   - Away Team vs Home Team
   - Kickoff time
   - Venue

2. **Data Freshness Panel** (Top of page, always visible)
   ```
   Data Freshness:
   ✓ Odds: Updated 5 minutes ago
   ⚠ Injuries: Updated 2 hours ago
   ✓ Weather: Updated 12 minutes ago
   ✓ Stats: Synced after Week 5 games
   ```

3. **Tabs:**
   - **Overview**
     - Prediction summary
     - Best available odds
     - Key matchup factors
   - **Odds**
     - Multi-book comparison
     - Historical odds movement
   - **Team Stats**
     - Season stats comparison
     - Recent form (last 5 games)
   - **Player Props** (if available)
     - Passing/rushing/receiving props
   - **Injuries**
     - Current injury reports
     - Impact scores
   - **Weather**
     - Hourly forecast
     - Severity analysis
   - **External Factors**
     - Rest & travel
     - Referee tendencies
     - Coaching notes
     - Pace & play calling
   - **Model Explanation**
     - Factor weights
     - Confidence breakdown
     - Edge vs market

**Example:**
```tsx
// src/app/nfl/[gameId]/page.tsx
import { DataFreshnessPanel } from '@/components/matchup/data-freshness-panel';
import { PredictionDisplay } from '@/components/matchup/prediction-display';
import { OddsComparison } from '@/components/matchup/odds-comparison';

export default async function GameDetailPage({
  params,
}: {
  params: { gameId: string };
}) {
  const game = await getGameById(params.gameId);
  const freshness = await evaluateFreshness(game);
  const prediction = await getLatestPrediction(params.gameId);

  return (
    <div>
      <DataFreshnessPanel data={freshness} />
      {freshness.hasStaleData && (
        <Alert variant="warning">
          Some data is stale. Prediction confidence reduced.
        </Alert>
      )}
      <PredictionDisplay prediction={prediction} game={game} />
      <Tabs>
        <TabPanel value="overview">...</TabPanel>
        <TabPanel value="odds">...</TabPanel>
        {/* ... */}
      </Tabs>
    </div>
  );
}
```

---

### `/admin` - Admin Dashboard

**Purpose:** Monitor system health and trigger manual refreshes

**Sections:**
1. **Provider Health**
   - Table of all providers
   - Status (healthy/degraded/unhealthy)
   - Latency
   - Last check time
2. **Job Status**
   - List of all background jobs
   - Last run time
   - Next run time
   - Success/failure status
3. **Manual Controls**
   - Refresh specific game
   - Trigger job manually

---

## Key Components

### DataFreshnessPanel

**Purpose:** Display age and status of all data sources

**Props:**
```tsx
interface DataFreshnessPanelProps {
  data: {
    odds: { timestamp: Date; status: 'FRESH' | 'AGING' | 'STALE' };
    injuries: { timestamp: Date; status: 'FRESH' | 'AGING' | 'STALE' };
    weather: { timestamp: Date; status: 'FRESH' | 'AGING' | 'STALE' };
    stats: { timestamp: Date; status: 'FRESH' | 'AGING' | 'STALE' };
  };
}
```

**Visual:**
```
┌──────────────────────────────────────────────┐
│ Data Freshness                               │
├──────────────────────────────────────────────┤
│ ✓ Odds: Updated 5 min ago                    │
│ ⚠ Injuries: Updated 2 hours ago (AGING)      │
│ ✓ Weather: Updated 12 min ago                │
│ ✓ Stats: Synced after Week 5                 │
└──────────────────────────────────────────────┘
```

---

### PredictionDisplay

**Purpose:** Show model prediction with confidence and edge

**Props:**
```tsx
interface PredictionDisplayProps {
  prediction: {
    homeWinProbability: number;
    projectedHomeSpread: number;
    projectedTotal: number;
    confidenceScore: number; // 1-5
    edgeVsMarket: number;
    recommendation: 'BET_HOME' | 'BET_AWAY' | 'NO_BET';
  };
  game: Game;
}
```

**Visual:**
```
┌──────────────────────────────────────────────┐
│ Model Prediction                             │
├──────────────────────────────────────────────┤
│ Home Win Probability: 62%                    │
│ Projected Spread: KC -4.5                    │
│ Projected Total: 48.5                        │
│                                              │
│ Confidence: ★★★★☆ (4/5)                      │
│ Edge vs Market: +2.3%                        │
│                                              │
│ Recommendation: NO BET (Edge < threshold)    │
└──────────────────────────────────────────────┘
```

---

### OddsComparison

**Purpose:** Compare odds across multiple bookmakers

**Visual:**
```
┌──────────────────────────────────────────────┐
│ Best Available Odds                          │
├──────────────────────────────────────────────┤
│ Moneyline:                                   │
│   KC: -180 (DraftKings)                      │
│   BUF: +155 (FanDuel)                        │
│                                              │
│ Spread:                                      │
│   KC -3.5 (-110) (BetMGM)                    │
│   BUF +3.5 (-110) (BetMGM)                   │
│                                              │
│ Total:                                       │
│   Over 47.5 (-110) (Caesars)                 │
│   Under 47.5 (-110) (Caesars)                │
└──────────────────────────────────────────────┘
```

---

### ExternalFactors

**Purpose:** Display all external factor scores with explanations

**Visual:**
```
┌──────────────────────────────────────────────┐
│ External Factors                             │
├──────────────────────────────────────────────┤
│ Weather Impact: 65/100 (MODERATE)            │
│   • Wind: 15 mph gusts                       │
│   • Temp: 28°F (feels like 18°F)             │
│   • Outdoor venue                            │
│                                              │
│ Rest & Travel: 40/100 (LOW)                  │
│   • KC: 6 days rest                          │
│   • BUF: 7 days rest, no time zone change    │
│                                              │
│ Referee Crew: Brad Allen                     │
│   • Avg penalties: 12.3/game                 │
│   • Home favoritism: +0.2                    │
│                                              │
│ Pace Advantage: KC (15% faster)              │
└──────────────────────────────────────────────┘
```

---

### ModelExplanation

**Purpose:** Transparency into how prediction was calculated

**Visual:**
```
┌──────────────────────────────────────────────┐
│ Model Explanation                            │
├──────────────────────────────────────────────┤
│ Factor Contributions:                        │
│   Team Strength (ELO):        +8% to KC      │
│   Recent Form:                +3% to KC      │
│   Home Field Advantage:       +2.5% to KC    │
│   Injury Impact:              -1% to KC      │
│   Weather Severity:           -2% to total   │
│   Rest & Travel:              Neutral        │
│                                              │
│ Confidence Score: 4/5                        │
│   Data Freshness: ✓ All fresh                │
│   Model Uncertainty: Low                     │
│   Optional Factors: Disabled                 │
│                                              │
│ Model Version: v1.0                          │
│ Last Updated: 2026-01-04 14:32:15            │
└──────────────────────────────────────────────┘
```

---

## Responsive Design

- **Desktop (>1024px):**
  - 3-column game grid
  - Side-by-side stats comparison
  - Full width tables

- **Tablet (768px-1024px):**
  - 2-column game grid
  - Stacked stats sections

- **Mobile (<768px):**
  - 1-column game grid
  - Collapsible sections
  - Simplified tables

---

## Loading States

Every page should have:
- Skeleton loaders for async data
- Suspense boundaries
- Error boundaries with retry

---

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance (WCAG AA)
- Screen reader friendly

---

## SEO

- Dynamic meta tags per game
- Structured data (JSON-LD)
- Open Graph tags
- Sitemap generation
