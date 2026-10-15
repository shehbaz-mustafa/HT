# HT — Habit & Task Ledger

A fully functional, intentional task management and habit tracking web application built with Next.js (App Router), TypeScript, TailwindCSS, and Supabase, adhering strictly to the Google Stitch editorial ledger design system (warm parchment tones, forest green accents, Georgia typography, and structured tabular layouts).

## Features Implemented

### 1. Task Management — Complete CRUD
- **Creation & Editing**: Create tasks with title, description, due date, start time, deadline, priority (`Urgent`, `High`, `Medium`, `Low`), category, tags, and recurring schedule (`Daily`, `Weekdays`, `Weekly`, `Monthly`).
- **Interactive Drawer**: Detailed task drawer allowing real-time edits, completion toggling, tag management, and permanent deletion with confirmation.
- **Projects & Task Lists**: Organize tasks by project (`Inbox`, `Deep Work`, `Personal`, `Vitality`), create custom lists with distinct color swatches, and safely delete lists.
- **Organization & Filtering**:
  - Filter tabs: `All Tasks`, `Today`, `Upcoming`, `Overdue`, `Completed`.
  - Sort by: `Due Date`, `Priority`, `Title`, `Date Created` (Ascending / Descending).
  - Group by: `None`, `Project`, `Priority`, `Status`.
  - Live search across titles, descriptions, categories, and tags.
  - Manual task reordering (Move Up / Down).
- **Overdue Management**: Highlighted overdue banner with one-click "Move to Today" action.

### 2. Habit Tracking — Schedule-Aware Consistency
- **Customizable Habits**: Habit name, description, custom emoji/icon, theme color, category, reminder times, and status (`Active`, `Paused`, `Archived`).
- **Schedule-Aware Streaks**: Real streak calculations that respect each habit's schedule (e.g. Mon/Wed/Fri habits do not lose streak continuity on unscheduled days).
- **Target Types**:
  - Binary checkbox (`Done` / `Not Done`).
  - Numeric target (e.g. 2.5 Litres of water, 25 Pages reading) with live incremental steppers (`+` / `-`).
- **Interactive Ledger**: 7-day and 14-day history strips allowing users to correct or check off past dates without corrupting streak math.
- **Check-in Notes**: Record notes and reflections for any individual habit check-in.

### 3. Today's Plan & Dashboard
- **Personalized Header**: Time-aware greeting (`Good morning / afternoon / evening`) with formatted date stamp.
- **Live Progress Cards**:
  - Today's tasks completion percentage and animated progress bar.
  - Scheduled habits completion rate and progress bar.
  - Streak leader spotlight with consecutive days counter.
- **Overdue Tasks Strip**: Prominent alert for tasks requiring immediate attention.
- **Weekly Ledger Strip**: 7-day compact view showing completion square matrices for each day of the week.
- **Two-Column Execution Board**: Today's tasks on the left with quick-inline creation, today's scheduled habits on the right with numeric steppers.

### 4. Calendar & Schedule Planner
- **Multi-View Modes**: Full `Month`, `Week`, and `Day` view modes.
- **Date Navigation**: Previous/Next period navigation and instant "Jump to Today".
- **Integrated Scheduling**: Tasks and scheduled habits cross-referenced on their due dates.
- **Interactive Selected-Day Agenda Drawer**: Inspect any calendar date, toggle habit completions, view tasks due, add new tasks directly for that date, and reschedule tasks with a date picker.

### 5. Performance Analytics & Insights
- **Key Performance Indicators**: Tasks completed today/week/month, completion rate %, overdue count, average habit consistency %, and perfect days count.
- **Weekly Cadence Bar Chart**: SVG bar chart displaying weekly check-ins across the last 12 weeks with target ceiling indicators.
- **Focus Allocation**: Category completion volume with proportional progress indicators.
- **20-Week Activity Heatmap**: Contribution matrix visualizing cumulative task and habit execution.
- **Continuity Leaderboard**: All habits ranked by active streak and longest streak records.
- **Audit Trail**: Real-time chronological activity log of completed items.

### 6. Settings, Customization & Data Backup
- **User Profile**: Display name, email account, and timezone selector.
- **Theme Engine**: Toggle between Parchment Light and Editorial Dark modes.
- **Notifications**: Browser Web Notifications permission handler and customizable lead times.
- **Data Portability**:
  - Export Full Ledger as JSON.
  - Export Tasks as CSV.
  - Export Habits as CSV.
  - Restore / Import from JSON backup.
  - Reset to sample data.
- **Keyboard Shortcuts**: Quick Add (`Q` or `N`), Shortcuts Menu (`?`), Close (`Esc`).

### 7. Persistence & Auth Strategy
- **Dual-Tier Resilient Architecture**:
  - When Supabase is configured and online, connects via `@supabase/ssr` with RLS policies and SQL migrations.
  - Fully integrated local persistent store (`localStorage` + `cookies`) that persists across page refreshes, tab closures, and browser restarts.
  - 1-click **Guest / Demo Mode** allowing immediate testing and evaluation without waiting on external email verification.

---

## Setup & Running Locally

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Ensure the following variables are defined in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Migrations (Supabase)
Apply the initial migration and the new tasks & habits enhancement migration:
- `supabase/migrations/20241013000000_init.sql`
- `supabase/migrations/20261015000000_tasks_and_habit_enhancements.sql`

To push to your Supabase project:
```bash
npx supabase db push
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Quality Assurance Checks
```bash
# TypeScript strict type checking
npm run typecheck

# Code formatting
npm run format
```
