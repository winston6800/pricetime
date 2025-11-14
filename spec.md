# Loop Burn Engine — Product Spec

**Tech Stack:** Next.js 15, TypeScript, React 18, Clerk (Auth), Neon (PostgreSQL), Prisma (ORM)

---

## Core Concept

A productivity timer that makes the cost of time visible. Users set an hourly rate, work on tasks, and see real-time money spent. Tracks productivity with charts and helps identify time-wasting distractions.

**Key Principle:** Fast, focused, no friction. Single active timer. Clear opportunity cost.

---

## User Journey

### 1. Landing Page (Public - `/`)

**Target Audience:** Doers, ambitious professionals, entrepreneurs and sales people who understand time = money and need urgency to act.

**User Experience Flow:**

**Above the fold:**
- **Headline:** "Every minute you waste costs you money"
- **Subheadline:** "See the real cost of your time. Make every second count."
- **Value prop:** "You know your hourly rate. Now see it burn in real-time. Track what matters, eliminate what doesn't."
- **Primary CTA:** Large, prominent "Start Tracking Now" button → `/sign-up`
- **Urgency element:** "Join [X] doers who've reclaimed [Y] hours this month"

**Social proof (below hero):**
- Quick stat: "Average user saves 2.3 hours/day by seeing time cost"
- Testimonial snippet (optional): "Finally, I can see where my time actually goes" - [Name, Title]

**Features (3-column grid, visual icons):**
1. **Real-time cost tracking:** "Watch your hourly rate burn. Every second counts."
2. **Productivity insights:** "See what moves the needle. Cut what doesn't."
3. **Distraction awareness:** "Track time-wasters. Eliminate them."

**How it works (simple 3-step):**
1. Set your hourly rate
2. Start a task, watch the cost
3. See patterns, optimize your day

**Final CTA section:**
- "Stop guessing. Start tracking."
- "Get Started" button
- "Free forever. No credit card."

**Navigation:**
- Top right: "Sign In" link (subtle, for returning users)
- Logo/brand name (top left)

**Design principles:**
- Clean, minimal, professional
- Bright for energy, but simple like how openai makes their stuff clear
- Numbers/stats visible (creates FOMO)
- Mobile-first responsive

### 2. Authentication (`/sign-in`, `/sign-up`)
- **Sign up/Sign in:** Clerk handles all auth (email/password, OAuth)
- **After successful auth:** Redirect to main app (`/app`)
- **First-time users:** Initialize with defaults (hourly rate $90, empty state)
- **Returning users:** Load existing data from database

### 3. Navigation & Sign Out
- **Sign out button:** Available in main app (top right or header)
  - Signs user out via Clerk
  - Redirects to `/sign-in` page after sign out
- **Home button:** Available in main app (top left or header)
  - Takes user to landing page (`/`)
  - Works even when signed in (shows landing page, but can access `/app` if needed)

### 4. Pricing Page (Public - `/pricing`)
- **Target:** Convert free users to paid, show value of premium features
- **Layout:** Clean, comparison-focused, mobile-responsive
- **Pricing tiers:**
  - **Free:** Core timer, basic tracking, 30-day history, single device
  - **Pro ($9/month or $90/year):** Unlimited history, multi-device sync, export data, priority support, advanced analytics
- **CTA:** "Start Free" for free tier, "Upgrade to Pro" for paid
- **Social proof:** "Join 1,247 doers using PriceTime"
- **FAQ section:** Common questions about pricing, features, cancellation

### 5. Main App (Authenticated - `/app`)
[All features below are post-login, protected by Clerk middleware]

---

## Features

### Main Timer
- **Hourly rate input** (default: $90/hr, editable)
- **Task name input** with category selector (Rock/Pebble/Sand)
- **Live timer** (MM:SS format, updates every second) - perpetually running, cannot be stopped 
- **Money spent display** (large, prominent) with $/min and $/sec breakdown
- **Finish Task button** (saves to history, resets timer to 0:00, ready for next task)
- **Login streak badge** (shows consecutive days, green if ≥7 days)

### Task Categories
- **Rock** (red): Critical, high-value tasks
- **Pebble** (orange): Important but less urgent
- **Sand** (gray): Low-priority tasks

Category selected before/during task, saved with task in history.

### Productivity Chart
- Line chart showing tasks completed per day (last 7 days)
- Toggle: "Show All" (single line) or "Show Minerals" (3 lines by category)
- Colors: red (rock), orange (pebble), gray (sand)
- Updates immediately when task finished
- Shows zeros for days with no tasks
- Shows how much time and money went unaccounted for. 

### Open Loops (Distractions)
- **Placement**: Below Task History (secondary feature, less prominent)
- **Default state**: Collapsed/minimized by default to minimize distractions
- Minimizable section to track distractions
- Add loop: textarea (auto-expands), adds to list
- Each loop has: name, timer, cost ($1000/hr default), play/pause button
- Only one loop active at a time (pauses main task when active)
- Checkbox removes loop from list

### Task History
- **Organization**: Tasks grouped by date (Today, Yesterday, This Week, Last Week, Older)
- **Collapsible date groups**: Each date group can be expanded/collapsed
- **Task entry**: Each task shows:
  - Name, category badge (Rock/Pebble/Sand), cost, timestamp, duration
  - Delete button per task
- **Search/filter**: 
  - Search by task name
  - Filter by category (All, Rock, Pebble, Sand)
  - Filter by date range
- **Sort options**: 
  - Newest first (default)
  - Oldest first
  - Highest cost first
  - Longest duration first
- **Pagination or "Load more"**: For users with many tasks, show 20-30 at a time
- **Visual hierarchy**: 
  - Date headers are prominent
  - Tasks within each day are clearly grouped
  - Category badges are color-coded and visible
- **Quick stats per day**: When date group is expanded, show daily totals (tasks, time, cost) for that day

### Progress Dashboard (Task History Insights)
- **Summary cards** above task list (when history not minimized):
  - Total tasks, total time (hrs), total cost for selected timeframe
  - Category breakdown: Percentage/time spent on Rocks/Pebbles/Sand
  - Best day/week: Period with most tasks completed
  - Trend: Comparison to previous period (↑/↓ percentage)
- **Timeframe selector**: Toggle between "This Week" and "Last 30 Days"
- **Visual breakdown**: Simple bar chart or pie chart showing category distribution for selected timeframe
- **Quick stats**: Average tasks per day/week, total hours tracked, total cost
- **Patterns shown by timeframe**:
  - **This Week**: Daily breakdown, day-by-day trends, best day
  - **Last 30 Days**: Weekly totals (4-5 weeks), weekly trends, category shifts, best week, overall 30-day summary
- **Display**: Shows when task history is expanded, collapses with history
- **Data aggregation**: Automatically groups tasks by selected timeframe, calculates totals and averages

---

## User Flows

### First Visit (Landing)
1. User lands on homepage
2. Sees value prop + features
3. Clicks "Get Started" → redirects to `/sign-up`
4. Optional: User clicks "Pricing" link → sees pricing page

### Pricing Page Visit
1. User lands on `/pricing` (public, no auth required)
2. Sees Free vs Pro comparison
3. Clicks "Start Free" → redirects to `/sign-up`
4. Or clicks "Upgrade to Pro" → redirects to `/sign-up` (then payment flow)

### First Use (After Sign Up)
1. Clerk sign-up flow
2. Redirected to app
3. App checks: no user data exists → initialize defaults
4. Show empty state with default hourly rate ($90)
5. User can start immediately

### Daily Use
1. Enter task name, select category
2. Timer runs automatically (starts when task entered)
3. See money spent increase in real-time
4. Click "Finish Task" → saves to history, resets timer, ready for next task

### Sign Out Flow
1. User clicks "Sign Out" button in app
2. Clerk signs user out
3. Redirects to `/sign-in` page
4. User can sign back in or navigate to landing page

### Navigation Flow
1. User clicks "Home" button in app
2. Redirects to landing page (`/`)
3. If signed in, can still access `/app` directly
4. Landing page shows for all users (public)

### Login Streak
- Check on page load: did user visit yesterday?
- Consecutive day → increment streak
- Gap > 1 day → reset to 1
- Show badge if streak > 0

---

## Backend Architecture

**Database:** Neon PostgreSQL (free tier, serverless, auto-scales)
- Free tier: 0.5GB storage, sufficient for early stage
- Serverless: scales automatically, no server management
- Connection pooling included

**ORM:** Prisma
- Type-safe database access
- Easy migrations
- Auto-generated TypeScript types

**API:** Next.js API routes
- Server-side only (no direct DB access from client)
- Protected by Clerk middleware
- All data operations go through `/api/*` routes

**Auth:** Clerk
- Handles sign-in/sign-up/sessions
- User ID used as database key
- Middleware protects routes automatically

**Setup for 0 users:**
1. Create Neon account (free tier)
2. Create Clerk account (free tier: 10k MAU)
3. Install: `@clerk/nextjs`, `@prisma/client`, `prisma`
4. Initialize Prisma schema
5. Deploy: Vercel (free tier) for Next.js + Neon

**Cost:** $0/month until you scale (free tiers cover early growth)

---

## Data & Storage

**Database schema (Prisma):**
- `User` table: `id` (Clerk user ID, primary key), `createdAt`, `updatedAt`
- `UserData` table: `userId` (foreign key), hourly rate, current task, category, timer (seconds), UI preferences, login streak, last login date
- `TaskHistory` table: `id`, `userId`, name, category, cost, timestamp, duration
- `OpenLoop` table: `id`, `userId`, name, timer, rate, active state

**Data flow:**
- Client → API route → Prisma → Neon database
- API routes verify auth via Clerk (`auth()` helper)
- All queries filtered by `userId` (data isolation)

---

## Calculations

- **Money spent** = (timer seconds ÷ 3600) × hourly rate
- **Per minute** = hourly rate ÷ 60
- **Per second** = hourly rate ÷ 3600
- Round to 2 decimals, display with $ prefix

---

## Edge Cases

- Timer persists across page refresh (save start time in database)
- Empty task name → allow finish (save as empty/untitled)
- Invalid hourly rate → default to 90 if < 1
- No chart data → show 7 days of zeros
- Open loop active when main task finishes → pause loop, reset main timer
- Multiple tabs → sync via database (real-time updates via polling or websockets later)
- User not authenticated → redirect to sign-in
- Database connection fails → show error, allow retry

---

## Visual Design

- Minimal, clean UI
- System font (Inter)
- Background: #f8f9fa
- Cards: white with subtle shadows
- Money: red (#e74c3c)
- Primary actions: blue (#3498db)
- Categories: red (rock), orange (pebble), gray (sand)
- Streak: yellow (<7 days), green (≥7 days)

---

## Chrome Extension

- Same codebase, webpack bundle for popup
- Uses same API routes (authenticated via Clerk)
- Icons: 16px, 48px, 128px
- Note: Extension auth flow may need special handling (popup window for Clerk sign-in)

---

## Pricing Strategy

**Free Tier:**
- Core timer functionality (perpetual timer, cost tracking)
- Basic task history (30 days)
- Single device
- Basic productivity chart
- Open loops tracking
- Login streak
- **Limitations:** 30-day history limit, no data export, no multi-device sync

**Pro Tier ($9/month or $90/year - 17% savings):**
- Everything in Free
- Unlimited task history
- Multi-device sync (real-time)
- Export data (CSV, JSON)
- Advanced analytics (weekly/monthly reports, time breakdowns)
- Priority support
- Custom hourly rates per category
- **Value prop:** "Save 2+ hours/day = $180+ value. Pro costs $9/month."

**Pricing Logic:**
- Free tier: Builds habit, creates value, word-of-mouth growth
- Pro tier: Targets users who see real value (saving 2+ hours/day = $180+ monthly value)
- Annual discount: 17% off encourages commitment, better cash flow
- No credit card for free: Reduces friction, increases sign-ups
- Simple 2-tier model: Easy to understand, no decision paralysis

**Revenue Projections (Early Stage):**
- 1,000 free users → 5% conversion = 50 Pro users
- 50 × $9/month = $450/month = $5,400/year
- At scale: 10,000 free → 500 Pro = $4,500/month = $54,000/year

---

## Implementation Notes

**Auth:**
- Clerk middleware protects all routes except `/sign-in`, `/sign-up`, `/` (landing page), and `/pricing`
- Public routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/pricing`
- Protected routes: Everything else (including `/app`)
- Use `auth()` from `@clerk/nextjs` to get current user in API routes
- Client: use `useUser()` hook to check auth state
- Sign out: Use `useClerk().signOut()` to sign out, redirect to `/sign-in`
- Navigation: Home button links to `/` (landing page)

**Database:**
- Prisma Client generated from schema
- Use connection pooling URL from Neon (production)
- Direct connection URL for local dev

**API Routes:**
- `/api/data` - GET (load user data), POST (save user data)
- `/api/tasks` - GET (load history), POST (finish task), DELETE (remove task)
- `/api/loops` - GET (load open loops), POST (add/update loop), DELETE (remove loop)
- All routes: verify `userId` from Clerk, filter queries by `userId`

**State Management:**
- Client: React hooks + API calls (no localStorage)
- Timer: perpetually running, updates every second on screen, saves to database every 10 seconds
- Data saves: debounced 2 seconds for user settings, 10 seconds for timer
- Chart: Recharts library, memoize to prevent re-renders
- Prisma logging: errors only (no query logs to reduce console spam)

---

## Roadmap

**v1 (current):** Landing page, auth, main timer, categories, chart, open loops, history, streaks, database

**v1.1:** Export/import JSON, custom rates per category, time goals, real-time sync

**v1.2:** Multi-device sync improvements, weekly/monthly reports, data analytics

**v2:** Team workspaces, shared goals, leaderboards
