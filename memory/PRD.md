# Stradar — Environmental Change Radar (frontend refresh)

## Original problem statement
> https://github.com/clecoentddd/quadrant-compass-view.git — refresh the UI and split the
> dashboard.tsx file into separate elements: once the user has signed with an organisation,
> show teams as a company organigram. User selects a team moving to a new page where they can
> edit team attributes and see the radar and makes changes, they can access their strategies
> from there. Modern and slick.

## Constraints from user
- Reuse existing backend (`baseUrl` in localStorage, default `http://localhost:3000`) — no new backend endpoints invented
- Do NOT change radar element colors (green LOW / amber MEDIUM / red HIGH) or shapes (triangle THREAT / circle OPPORTUNITY)
- Keep existing Supabase auth
- Focus on React UI + ergonomics

## Architecture
- CRA + craco (existing) — Tailwind v3, react-router-dom v7
- Ported from Vite/TanStack repo `clecoentddd/quadrant-compass-view`
- No FastAPI/MongoDB usage (backend lives on user's machine)
- Domain lib: `src/lib/radar-model.js`, `src/lib/stradar-api.js`
- Pages routed:
  - `/login` → `LoginPage`
  - `/organizations` → `OrganizationsPage`
  - `/workspace/:orgId` → `OrgWorkspacePage` (top-down organigram)
  - `/workspace/:orgId/team/:teamId` → `TeamPage` (edit attributes + radar + strategies list)
  - `/workspace/:orgId/team/:teamId/strategy/:strategyId` → `StrategyPage` (initiatives + kanban modal)

## What's implemented (2026-02-18)
- Modern deep-space theme (oklch, Space Grotesk / JetBrains Mono fonts, glass surfaces, radar backdrop, grain overlay)
- `AppHeader` with breadcrumbs, sticky glass, switch org, sign out
- `TeamOrganigram` — organization node at top, spine + drop connectors, team cards in a grid (top-down, cards)
- Full CRUD flows preserved (orgs, teams, strategies, env-changes, initiatives, initiative items)
- New: `PUT /api/organizations/:orgId/teams/:teamId` in api client for team attribute update (Save button on TeamPage)
- Radar component ported unchanged — colors, shapes, sweep animation all preserved
- Modals (`Modal`, `TextField`, `SelectField`, `ActionRow`, `Toast`) share a consistent UI kit
- `data-testid` on all interactive elements + key info elements

## Data flow
- Auth token + email + baseUrl + supabase config live in localStorage
- Every page guards with `getConfig().token`; 401 → clearAllAuth + redirect to /login
- Team update PUT expects backend endpoint `PUT /api/organizations/:orgId/teams/:teamId`

## Backlog / next tasks (P1)
- Deep-link protection: refresh on Team page reloads properly (currently loads orgs/teams in parallel — OK)
- Rename team + purpose validation
- Environmental change edit + delete
- Multi-level org hierarchy (nested teams using `parentTeamId`)
- Bulk-view strategies across all teams
- Test coverage (Playwright happy paths)
