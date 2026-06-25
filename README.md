# Runtime Tasks

A dark-themed task management SPA for engineers. Manage tasks, track focus time, and visualize productivity — all in the browser.

## Features

- **Dashboard** — overview with today's tasks, productivity score, streak, focus timer, activity heatmap, and upcoming deadlines
- **Tasks** — create, edit (double-click), search, filter by priority/category/status, mark complete, delete
- **Kanban Board** — drag-and-drop across Backlog, In Progress, Review, Completed columns
- **Analytics** — weekly activity bar chart, focus time trends, completion rate, streak tracking, 6-month activity heatmap
- **Focus Timer** — Pomodoro-style timer (focus/break cycles), session tracking, sound notifications
- **Command Palette** — `Ctrl+K` to quickly navigate pages or trigger actions
- **Keyboard Shortcuts** — `Ctrl+N` new task, `g d/t/b/a/f/s` page navigation, `Escape` close modals
- **Settings** — customize focus/break duration, toggle sound, clear all data

## Tech

- Pure vanilla JS (no framework) using a modular architecture: `utils/`, `services/`, `hooks/`, `ui/`, `features/`
- Tailwind CSS via CDN with a custom design system (dark theme, Geist font, Material Symbols icons)
- Local storage persistence
- No build step — open `index.html` directly

## Usage

Open `index.html` in any modern browser. All data persists in `localStorage`.
