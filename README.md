# 🍄 Super Mario 2D (5-Level Platformer)

A classic 2D Super Mario platformer built from scratch using **TypeScript**, **SQLite**, and **Docker**. This project is completely self-contained with **zero local host dependencies** — you don't need Node.js, npm, or SQLite installed on your machine. Simply launch it with Docker!

---

## 🚀 Quick Start (Docker)

Make sure [Docker Desktop](https://www.docker.com/) is installed and running, then execute:

```bash
docker compose up --build
```

Once the container is ready, open your web browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

### Stop the Container
```bash
docker compose down
```

> **Persistent SQLite Storage:**
> The SQLite database is mounted to `./data/mario.db` on your host machine via Docker volumes. High scores, leaderboard rankings, and game save states persist across container restarts and rebuilds.

---

## 🎮 Game Controls

| Action | Keyboard | Touch / Mobile Screen |
| :--- | :--- | :--- |
| **Move Left / Right** | `←` / `→` or `A` / `D` | Virtual D-Pad `◀` / `▶` |
| **Jump** (Variable height) | `Space` or `W` or `Z` | Virtual Button `A` |
| **Sprint / Run Fast** | `Shift` or `X` | Virtual Button `B` |
| **Pause Game** | `P` or `Escape` | Pause Menu Button |
| **Mute / Unmute Audio** | `M` | In-Game Pause Menu |

---

## 🗺️ 5 Themed Levels

1. **World 1-1 (Overworld)**:
   - Classic grassy hills, blue skies, and fluffy clouds.
   - Mystery `[?]` blocks containing Coins and the **Super Mushroom** (transforms Mario into 32px Super Mario).
   - Goomba enemies that can be stomped from above.
   - Stone staircases leading to the iconic **Flagpole** finish.

2. **World 1-2 (Underground Cavern)**:
   - Subterranean stone cavern with low brick ceilings and perilous floating platforms.
   - **Koopa Troopa** enemies: stomp to retract into a shell, then kick the sliding shell to eliminate other enemies in its path!
   - Warp pipe exit at the end leading up to the treetop canopies.

3. **World 1-3 (Athletic Treetops)**:
   - Sunset peach skies with floating pink clouds and towering mushroom platforms.
   - High-altitude precision platforming with narrow stepping stones and deep drops.
   - Parapet staircases leading to the mountain flagpole.

4. **World 1-4 (Night Ruins)**:
   - Deep midnight blue sky illuminated by glittering stars and a crescent moon.
   - Ancient stone fortress ruins guarded by spinning **Firebar** obstacles and Koopas.
   - Subterranean warp pipe descending directly into Bowser's stronghold.

5. **World 1-5 (Bowser's Castle & Final Boss Fight)**:
   - Dark fortress with bubbling lava pits (instant elimination on contact).
   - Rotating **Firebar** obstacles and floating battlements.
   - **Bowser Boss Fight** stationed across a drawbridge over molten lava: Bowser hops and unleashes fireballs.
   - Jump past Bowser and hit the **Axe Switch** to collapse the bridge, sending Bowser tumbling into the lava to rescue the Mushroom Kingdom!

---

## 🌟 Key Features & Architecture

- **60 FPS Physics Engine**:
  - Variable jump height (holding jump key jumps higher).
  - Coyote time (grace period for jumping after walking off an edge) and jump buffering (early jump input registration before landing).
  - AABB tilemap collision resolution with sub-pixel precision.
  - Smooth bidirectional camera scrolling (backtrack to collect missed coins or power-ups).
- **Procedural 8-Bit Audio Synthesis (Web Audio API)**:
  - 100% self-contained retro chiptune sound effects (jump, stomp, coin chime, brick smash, power-up, death melody, level clear fanfare).
  - Background music (BGM) loops for Overworld, Underground, and Castle themes with instantaneous mute toggle (`M`).
- **SQLite Database & REST API**:
  - Top 10 High Scores Leaderboard persisted in SQLite.
  - Save Game states with auto-save at level entry and manual slots in the Pause Menu.
  - Backed by Node.js, Express, and `better-sqlite3`.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check status |
| `GET` | `/api/leaderboard` | Retrieve top 10 high score records |
| `POST` | `/api/leaderboard` | Submit a new player high score |
| `GET` | `/api/saves` | List all saved game slots |
| `GET` | `/api/saves/:slot` | Retrieve specific save slot data |
| `POST` | `/api/saves` | Save current game progress (level, coins, score, lives) |

---

## 🛠️ Local Development (Optional)

If you have Node.js (v20+) installed and wish to run the app outside Docker:

```bash
# 1. Install dependencies
npm install

# 2. Run backend and frontend concurrently
npm run dev:server   # Starts Express API server on port 3000
npm run dev:client   # Starts Vite development server on port 5173
```

To build and run production locally:
```bash
npm run build
npm start
```
