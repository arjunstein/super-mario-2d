# Agent Guidelines: Super Mario 2D

## Repository Overview
A 2D Super Mario platformer built from scratch in TypeScript, backed by SQLite (`better-sqlite3`) for persistent leaderboards and save states, and fully containerized via Docker and Docker Compose.

---

## Directory Map

- `src/`: Client TypeScript (bundled by Vite to `dist/`).
  - `src/engine/`: Core game loop (`Game.ts`), 2D canvas pixel renderer (`Renderer.ts`), AABB physics and collision (`Physics.ts`), smooth bidirectional camera (`Camera.ts`), Web Audio API procedural sound synthesizer (`Audio.ts`), input management (`Input.ts`), and common types (`Types.ts`).
  - `src/entities/`: Mario (`Player.ts`), enemies (`Enemy.ts`), items (`Collectible.ts`), obstacles (`Firebar.ts`), debris and score popups (`Particle.ts`).
  - `src/levels/`: Tilemap level definitions (`Level1.ts` Overworld, `Level2.ts` Underground, `Level3.ts` Castle & Bowser).
  - `src/ui/`: Status bar (`HUD.ts`), retro menus (`Menu.ts`), SQLite modal (`LeaderboardModal.ts`).
  - `src/style.css` & `src/main.ts`: Arcade styling and DOM bootstrap.
- `server/`: Express HTTP server and SQLite backend (compiled to `dist-server/`).
  - `server/db.ts`: `better-sqlite3` schema, WAL mode, queries for `leaderboard` and `game_saves`.
  - `server/routes.ts`: REST API endpoints (`/api/health`, `/api/leaderboard`, `/api/saves`).
  - `server/index.ts`: Server entry point serving API and static frontend bundle.
- `data/`: Host volume mount directory for `mario.db`. Never commit database files to version control.
- `Dockerfile` & `docker-compose.yml`: Multi-stage Alpine containerization.

---

## Commands & Workflows

Run all commands from the repository root.

### Docker (Primary & Production Workflow)
- **Build and start container**: `docker compose up -d --build`
- **View container logs**: `docker compose logs -f`
- **Restart container**: `docker compose restart`
- **Stop container**: `docker compose down`
- **Default Port**: `http://localhost:3000`

### Local Development (Host Machine)
- **Install dependencies**: `npm install`
- **Typecheck both client & server**: `npm run typecheck`
- **Full build (client + server)**: `npm run build`
- **Run server in dev watch mode**: `npm run dev:server` (Express API on port 3000)
- **Run client in dev watch mode**: `npm run dev:client` (Vite on port 5173, proxies `/api` to 3000)
- **Run production server locally**: `npm start` (serves `dist/` via `dist-server/index.js`)

---

## Critical Architecture & Change Rules

### 1. Canvas 2D Rendering Pipeline Order
- **Screen Space vs World Space**:
  1. Always clear the entire screen with `Renderer.clear()` in **Screen Space** (with identity transform).
  2. Draw parallax backgrounds (clouds, hills, pillars) in **Screen Space** using modulo arithmetic relative to viewport dimensions (320x240).
  3. Apply camera translation (`ctx.save()`, `ctx.translate(Math.round(-camX + shake.x), Math.round(shake.y))`).
  4. Render world entities (tiles, player, enemies, collectibles, particles).
  5. Restore context (`ctx.restore()`).
  6. Render HUD and fixed UI in **Screen Space**.
- **Never call `clear()` after `ctx.translate()`**: Doing so causes smearing/ghosting artifacts across the screen.

### 2. Zero External Assets Policy
- Do not import external image files (PNG/JPEG) or external audio files (MP3/WAV) over HTTP.
- Visuals are procedurally drawn with crisp retro pixel methods on Canvas 2D (`image-rendering: pixelated`).
- Sound effects and music are synthesized on-the-fly using the Web Audio API (`AudioContext`).

### 3. Physics & Camera
- Fixed-timestep / clamped delta time (`dt = Math.min(..., 0.05)`) in `Game.loop()` prevents physics tunneling.
- Player coordinates must be clamped to level boundaries (`this.x >= 0`).
- Camera supports smooth bidirectional tracking (`Camera.follow()`).

### 4. Database & SQLite
- `better-sqlite3` runs synchronously with WAL mode enabled (`PRAGMA journal_mode = WAL`).
- Database directory is resolved from `process.env.DB_PATH` or `./data/mario.db`.
- When modifying database tables in `server/db.ts`, ensure schema migrations use `CREATE TABLE IF NOT EXISTS` and do not break existing columns.

### 5. Dockerfile Constraints
- Alpine requires `python3 make g++` in the builder stage to compile `better-sqlite3` native bindings.
- The runtime runner stage requires `libstdc++` and runs under non-root `appuser`.
- Ensure files inside `./data` are accessible to `appuser` (UID 1001/GID 1001).

---

## Safety & Boundaries
- Never commit binary database files (`*.db`, `*.db-wal`, `*.db-shm`) or `.env` files.
- Never use destructive Git commands (`git reset --hard`, `git push --force`) without explicit user consent.
- Always run `npm run typecheck` or verify Docker builds before completing a change.

