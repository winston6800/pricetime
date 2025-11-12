# Loop Burn Engine — Product Spec

**Tech Stack:** Next.js 15, TypeScript, React 18, Clerk (Auth), Neon (PostgreSQL), Prisma (ORM)

---

## Core Concept

A productivity timer that makes the cost of time visible. Users set an hourly rate, work on tasks, and see real-time money spent. Tracks productivity with charts and helps identify time-wasting distractions.

**Key Principle:** Fast, focused, no friction. Single active timer. Clear opportunity cost.

---

## User Journey

### 1. Landing Page (Public - `/`)
- **Hero section:**
  - Headline: "See the cost of every minute"
  - Subheadline: Value proposition (make time cost visible)
  - Primary CTA: "Get Started" → redirects to `/sign-up`
- **Features preview:**
  - Timer with cost tracking
  - Productivity charts
  - Distraction tracking
- **No auth required** to view landing page
- **Navigation:** Sign in link (top right) for returning users

### 2. Authentication (`/sign-in`, `/sign-up`)
- **Sign up/Sign in:** Clerk handles all auth (email/password, OAuth)
- **After successful auth:** Redirect to main app (`/app` or `/`)
- **First-time users:** Initialize with defaults (hourly rate $90, empty state)
- **Returning users:** Load existing data from database

### 3. Main App (Authenticated - `/app` or `/`)
[All features below are post-login, protected by Clerk middleware]

---

## Features

### Main Timer
- **Hourly rate input** (default: $90/hr, editable)
- **Task name input** with category selector (Rock/Pebble/Sand)
- **Live timer** (MM:SS format, updates every second)
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

### Open Loops (Distractions)
- Minimizable section to track distractions
- Add loop: textarea (auto-expands), adds to list
- Each loop has: name, timer, cost ($1000/hr default), play/pause button
- Only one loop active at a time (pauses main task when active)
- Checkbox removes loop from list

### Task History
- Minimizable list of completed tasks
- Each entry: name, category badge, cost, timestamp, duration
- Delete button per task

---

## User Flows

### First Visit (Landing)
1. User lands on homepage
2. Sees value prop + features
3. Clicks "Get Started" → redirects to `/sign-up`

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

## Implementation Notes

**Auth:**
- Clerk middleware protects all routes except `/sign-in`, `/sign-up`, and `/` (landing page)
- Public routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`
- Protected routes: Everything else (including `/app` if using separate route)
- Use `auth()` from `@clerk/nextjs` to get current user in API routes
- Client: use `useUser()` hook to check auth state

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
- Optimistic updates for better UX
- Timer: use ref for start time, interval updates every second
- Chart: Recharts library, memoize to prevent re-renders

---

## Roadmap

**v1 (current):** Landing page, auth, main timer, categories, chart, open loops, history, streaks, database

**v1.1:** Export/import JSON, custom rates per category, time goals, real-time sync

**v1.2:** Multi-device sync improvements, weekly/monthly reports, data analytics

**v2:** Team workspaces, shared goals, leaderboards
