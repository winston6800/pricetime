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
- "No credit card required to start."

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
- **Homepage button:** Top-left corner, dark gray button with home icon + "Home" text, links to landing page (`/`)
- **After successful auth:** Redirect to main app (`/app`)
- **First-time users:** Initialize with defaults (hourly rate $90, empty state)
- **Returning users:** Load existing data from database

### 3. Navigation & Sign Out

**Header:** Top of `/app` page, max-width 1200px, centered. Flexbox layout (space-between).

**Brand/Home Button (Left):** Company name "BurnEngine" (no icon), blue (#3498db), hover gray bg. `router.push('/')` - instant nav. Session preserved, landing page shows "Continue to App" if signed in.

**Sign Out Button (Right):** Icon + "Sign Out" text, gray bg (#f1f1f1), hover darker. Flow: `await useClerk().signOut()` → `router.push('/sign-in')`. Error: try/catch, log console, show message, stay on page. On success: redirect to sign-in.

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

### Task History
- **Organization**: Tasks grouped by date (Today, Yesterday, This Week, Last Week, Older)
- **Collapsible date groups**: Each date group can be expanded/collapsed
- **Task entry**: Each task shows:
  - Name, category badge (Rock/Pebble/Sand), cost, timestamp, duration
  - Edit category button: Click category badge or edit icon to change task type (Rock/Pebble/Sand)
  - Delete button per task
- **Edit category logic**:
  - Click category badge or edit icon → dropdown appears with Rock/Pebble/Sand options
  - Select new category → task updates immediately, badge color changes
  - Category change updates task in database, recalculates category breakdowns in Progress Dashboard
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
- **Timestamps**: Auto-detected from user's local timezone (browser locale). Future settings override planned.
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

### Outcomes Dashboard (Pro Feature)
- **Purpose**: Track money earned toward life-changing goals (e.g., retire parents, fund a trip).
- **Placement**: Bottom of page, to the right of Open Loops section (maintains design hierarchy).
- **Period Tracking**: Days since goal was committed (not weekly/monthly).
- **Data Sources**:
  - Task value earned: Optional field when finishing a task (defaults to $0, editable from task history).
  - Manual income entries: User can add money directly with confirmation dialog.
  - Future: Bank connection (Plaid) for auto-sync (Pro feature).
- **Logic**:
  - When goal is saved, store `goalCreatedAt` timestamp (UTC milliseconds).
  - Calculate days since goal creation = (current time - goalCreatedAt) / (24 * 60 * 60 * 1000).
  - Calculate total earned = sum of task valueEarned + manual income entries since goal creation.
  - Goal progress = (total earned / goal target) × 100.
  - Remaining = goal target - total earned.
  - Effective hourly rate = total earned ÷ total tracked hours since goal creation.
  - Top-valued task = task with highest valueEarned since goal creation.
- **Manual Entry Flow**:
  1. User clicks "Add Money" button.
  2. Modal opens with amount input and optional note.
  3. User enters amount, clicks "Confirm".
  4. Confirmation dialog shows: "Add $X to your goal? This will update your progress."
  5. User confirms → entry saved, dashboard updates immediately.
  6. User cancels → no entry created.
- **Goal Setup**:
  - If no goal exists: Show "Set a money goal" CTA.
  - Goal modal: Target amount, motivation text.
  - Save goal → stores target, motivation, and `goalCreatedAt` timestamp in UserData table.
  - When goal is saved, `goalCreatedAt` is set to current timestamp.
- **Display Logic**:
  - Show "Day X" where X = days since goal creation (rounded down).
  - Large earnings figure: Total earned since goal creation, formatted with shorthand for readability:
    - < $1,000: Show as "$XXX.XX" (2 decimals)
    - $1,000 - $999,999: Show as "$XK" (rounded to nearest thousand, no decimals)
    - ≥ $1,000,000: Show as "$X.XM" (1 decimal place)
  - Progress bar: Visual representation of earned vs target (both use same formatting).
  - Motivation text: Shows goal "Why" if set.
  - Quick stats: Effective hourly rate, top-valued task name + amount.
  - Empty state: "Track the money that retires your parents, pays off debt, or takes her abroad."

### Open Loops (Distractions)
- **Placement**: At the bottom, after Task History and Progress Dashboard (secondary feature, less prominent)
- **Default state**: Collapsed/minimized by default to minimize distractions
- Minimizable section to track distractions
- Add loop: textarea (auto-expands), adds to list
- Each loop has: name, timer, cost ($1000/hr default), play/pause button
- Only one loop active at a time (pauses main task when active)
- Checkbox removes loop from list

- **Access**: Pro users only (show upgrade prompt for free users)
- **Purpose**: Connect time spent to money earned and personal goals

**Layout (Single Card):**
- White card, subtle shadow, matches existing card style
- Padding: 24px vertical, 32px horizontal
- Clean spacing, no visual clutter

**Earnings Display:**
- **Large number**: Gross earned this period (week/month toggle)
  - Font: 48px, bold, green (#27ae60) for positive, gray (#95a5a6) if $0
  - Label above: "Earned" (12px, gray #7f8c8d)
  - Calculated from sum of `valueEarned` field from completed tasks in selected period
- **Period toggle**: Small toggle button (Week/Month) below earnings number
  - Default: Week
  - Style: Subtle gray buttons, active state blue (#3498db)

**Goal Progress:**
- **Progress bar**: Horizontal bar below earnings
  - Height: 8px, rounded corners
  - Background: light gray (#ecf0f1)
  - Fill: blue (#3498db) showing progress percentage
  - Width: 100% of card
- **Goal text**: Two lines below progress bar
  - Line 1: "Target: $X,XXX" (14px, gray #7f8c8d)
  - Line 2: "Remaining: $X,XXX" (14px, gray #7f8c8d)
  - If goal met: "Target reached!" (green #27ae60)
- **Personal "Why" label**: Subtle text above goal progress
  - Format: "For: [user's goal text]" (12px, italic, gray #95a5a6)
  - Examples: "For: Retire Mom & Dad", "For: Paris trip with Ana"
  - Only shows if goal is set

**Quick Stats (Minimal Row):**
- Two small pills below goal, side-by-side
- **Effective hourly rate**: "Avg: $XXX/hr" (12px, gray #7f8c8d)
  - Calculated: total earned ÷ total hours worked in period
- **Top task**: "Best: [task name]" (12px, gray #7f8c8d, truncated if long)
  - Shows task with highest `valueEarned` in period
- Spacing: 16px gap between pills

**Goal Setup:**
- **Empty state**: If no goal set, show "Set your goal" button (blue, subtle)
- **Setup modal**: Simple form (overlay, centered)
  - Field 1: "What are you working toward?" (textarea, 1-2 lines)
    - Placeholder: "Retire parents. Pay off debt. Take her abroad."
  - Field 2: "Target amount" (number input, $ prefix)
  - Field 3: "Period" (Week/Month radio buttons)
  - "Save Goal" button (blue, primary)
- **Edit goal**: Click anywhere on goal section → opens setup modal with current values

**Task Value Input:**
- **When finishing task**: Optional field appears in finish task flow
  - Label: "Value earned (optional)" (12px, gray)
  - Input: Number field, $ prefix, placeholder "$0"
  - Small helper text: "Feeds: [goal text]" if goal exists (10px, gray, italic)
  - Default: $0 (task still saves if left blank)
- **Edit later**: In Task History, click task → edit modal includes value field
- **Value stored**: Saved in `TaskHistory.valueEarned` field

**Visual Hierarchy:**
- Earnings number: Most prominent (48px)
- Goal progress: Secondary (visual bar + text)
- Quick stats: Tertiary (small, subtle)
- Personal "why": Subtle reminder (italic, light gray)

**Design Principles:**
- Single card, no nested sections
- Generous whitespace (24px vertical padding)
- No borders except card shadow
- Typography hierarchy: 48px → 14px → 12px → 10px
- Colors: Green for earnings, blue for progress, gray for text
- Mobile: Card stacks, stats wrap to two rows if needed

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
4. Click "Finish Task" → optional "Value earned" field appears (Pro users)
5. Enter value (or skip) → saves to history, resets timer, ready for next task
6. Outcomes Dashboard updates automatically (Pro users)


### Login Streak
- Check on page load: did user visit yesterday?
- Consecutive day → increment streak
- Gap > 1 day → reset to 1
- Show badge if streak > 0

### Outcomes Dashboard Setup (Pro Users)
1. User upgrades to Pro (or already Pro)
2. Sees Outcomes Dashboard above timer
3. If no goal set: clicks "Set your goal" button
4. Modal opens with three fields:
   - "What are you working toward?" (textarea with examples)
   - "Target amount" (number input)
   - "Period" (Week/Month)
5. User fills form, clicks "Save Goal"
6. Dashboard updates immediately showing goal progress
7. When finishing tasks, optional "Value earned" field appears
8. User enters value (or skips), dashboard recalculates automatically

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
- `TaskHistory` table: `id`, `userId`, name, category, cost, timestamp, duration, `valueEarned` (decimal, nullable, default 0)
- `OpenLoop` table: `id`, `userId`, name, timer, rate, active state
- `Goal` table: `id`, `userId`, `goalText` (text, nullable), `targetAmount` (decimal), `period` (enum: Week/Month), `createdAt`, `updatedAt` (one goal per user, latest is active)

**Data flow:**
- Client → API route → Prisma → Neon database
- API routes verify auth via Clerk (`auth()` helper)
- All queries filtered by `userId` (data isolation)

---

## Calculations

- **Money spent** = (timer seconds ÷ 3600) × hourly rate
- **Per minute** = hourly rate ÷ 60
- **Per second** = hourly rate ÷ 3600
- **Gross earned** = Sum of `valueEarned` from all tasks in selected period (week/month)
- **Effective hourly rate** = Total earned ÷ Total hours worked in period
- **Goal progress** = (Gross earned ÷ Target amount) × 100 (capped at 100%)
- **Remaining** = Target amount - Gross earned (if positive, else 0)
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
- No goal set → Outcomes Dashboard shows "Set your goal" button, earnings still calculated
- Task with $0 value → Still counts toward hours worked for effective rate calculation
- Goal period change → Recalculates progress based on new period's earnings
- Free user views Outcomes Dashboard → Show upgrade prompt with Pro benefits

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
- **Outcomes Dashboard** (earnings tracking, goal progress, effective hourly rate)
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

**Navigation Implementation:** Import `useClerk`, `useRouter`. Home: `router.push('/')`. Sign out: `try { await useClerk().signOut(); router.push('/sign-in') } catch { log, show error }`. Icons: FaHome, FaSignOutAlt from react-icons.

**Database:**
- Prisma Client generated from schema
- Use connection pooling URL from Neon (production)
- Direct connection URL for local dev

**API Routes:**
- `/api/data` - GET (load user data), POST (save user data)
- `/api/tasks` - GET (load history), POST (finish task), DELETE (remove task), PATCH (update task value)
- `/api/loops` - GET (load open loops), POST (add/update loop), DELETE (remove loop)
- `/api/goals` - GET (load active goal), POST (create/update goal), DELETE (remove goal)
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

**v1.1:** Export/import JSON, custom rates per category, time goals, real-time sync, **Outcomes Dashboard (Pro)**

**v1.2:** Multi-device sync improvements, weekly/monthly reports, data analytics

**v2:** Team workspaces, shared goals, leaderboards
