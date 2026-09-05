# Classroom Games Platform — Project Handoff

This document explains the whole system: what it is, how it's built, how to run a game day-to-day, how to add a new game, and how to fix the problems that come up most often. It assumes no prior context — hand it to anyone picking this up cold.

## 1. What this is and why it's built this way

This started as a single game, **Skew the Feed** (an AP Statistics game about identifying sampling/response bias), originally built as a Claude Artifact. Claude Artifacts that keep shared live data (a `db` capability) can't be made publicly link-shareable — only added to individual people by email — so a classroom of students without individual shares couldn't all reach it. That ruled out Claude Artifacts for anything with a public link and live shared state.

The replacement architecture:

- **GitHub Pages** hosts the actual game pages (static HTML/CSS/JS). Free, public, no login required for anyone opening the link.
- **A Google Sheet** is the database — one spreadsheet holding the student roster, live game sessions, in-progress scores, and historical results.
- **Google Apps Script**, attached to that Sheet, is deployed as a tiny web API. The GitHub-hosted pages call it over HTTP (`fetch`) to read and write the Sheet.
- **A shared `engine.js`** file holds everything common to every game — student identity, game codes, the round clock, and score syncing — so a second, third, or tenth game reuses it instead of rebuilding it.

This trades some things away compared to a "real" realtime backend (Firebase/Supabase, etc.): there's no push/realtime channel, so every page polls the backend on a timer rather than getting instant updates. In practice this is invisible for a classroom-sized game, but it's why some of the internals below are built around wall-clock timestamps instead of live push events.

## 2. Repository / folder structure

```
/engine.js                  ← shared engine, used by every game, never game-specific
/index.html                 ← landing page listing all games
/skew-the-feed/
    index.html               ← student-facing page for this game
    host.html                ← teacher/host dashboard for this game
/some-other-game/
    index.html
    host.html
```

Rules that keep this working:
- `engine.js` always stays at the repo root.
- Every game lives in its own folder at the root, alongside `engine.js`.
- A game's `index.html`/`host.html` load the engine with `<script src="../engine.js"></script>` — the `../` matters because the game files sit one folder *below* `engine.js`. If a game's HTML is ever placed directly at the repo root instead of in its own folder, that path must become `<script src="engine.js"></script>` (no `../`) or the script fails to load silently and the whole page's JavaScript dies (this exact bug came up twice during setup — see Troubleshooting).
- The root `index.html` is a simple static menu page linking to each game's folder (e.g. `skew-the-feed/`). It's just a landing page, not part of any game's logic.

GitHub Pages serves whatever file is named `index.html` in a folder as that folder's default page. That's why a bare folder URL like `.../skew-the-feed/` works without naming `index.html` explicitly.

## 3. The Google Sheet (the database)

One Sheet, four tabs. Tab names must match exactly (case-sensitive) because `Code.gs` looks them up by name.

**`Students`** — the roster, loaded once per year/term and otherwise left alone:
| student_id | last_name | first_name | nickname | display_name | period |
|---|---|---|---|---|---|

`display_name` is what shows on any screen (nickname if the student has one, otherwise first name) — student ID numbers are never displayed on shared screens, only typed at login.

**`Games`** — one row per game code ever created, across every game type. Rows are never deleted, so old codes stick around indefinitely — see `retired` below and §9's note on stale cached codes:
| code | gameType | round | durationSec | countdownEndsAt | gameEndsAt | startedAt | createdAt | retired |
|---|---|---|---|---|---|---|---|---|

`retired` is `false`/blank for every row until the host explicitly starts a *different* game — see the `createGame` write below. It's never set by starting a new round on the same code.

**`Players`** — live, in-progress scores for the *current* round. One row per student per round per game code; overwritten continuously as a student plays:
| code | round | gameType | studentId | displayName | period | score | streak | bestStreak | correct | attempted | updatedAt |
|---|---|---|---|---|---|---|---|---|---|---|---|

**`Runs`** — permanent history. One row appended per student per completed round, never overwritten:
| gameType | code | round | studentId | displayName | period | score | correct | attempted | accuracy | bestStreak | ts |
|---|---|---|---|---|---|---|---|---|---|---|---|

`Players` and `Runs` don't need header rows to function (the script reads by column position, not name) — headers are just for human readability if you want them.

## 4. The Apps Script backend (`Code.gs`)

Attached to the Sheet via **Extensions → Apps Script**. It's a small HTTP API:

**Reads (GET, query string params):**
- `?action=getStudent&id=19136` → looks up the roster, returns `{found, studentId, displayName, period}`
- `?action=getGame&code=ABCD` → returns the current state of that game code (including `retired`), or `{exists:false}`
- `?action=getPlayers&code=ABCD&round=1` → live scoreboard rows for that code+round, sorted by score
- `?action=getLeaderboard&gameType=skew-the-feed&code=ABCD&round=1` → rows from `Runs`. `code` and `round` are both optional: omit both for the all-time board across every game code ever played for that `gameType`; pass `code` alone for one game's full history; pass `code`+`round` for just that round's final results.

**Writes (POST, JSON body sent as `text/plain` — see §7 on why):**
- `createGame` `{code, gameType, retireCode?}` — adds a new `Games` row; if `retireCode` is given, marks that other row's `retired` true in the same lock (see `host.html`'s "Start a different game" action — a fresh round on the *same* code never passes this)
- `startRound` `{code, round, durationSec, countdownEndsAt, gameEndsAt}` — updates a `Games` row with a new round's timing
- `endRound` `{code}` — force-ends the current round early
- `updatePlayer` `{code, round, gameType, studentId, displayName, period, score, streak, bestStreak, correct, attempted}` — upserts a `Players` row
- `saveRun` `{gameType, code, round, studentId, displayName, period, score, correct, attempted, accuracy, bestStreak}` — appends a permanent `Runs` row

Every write goes through `LockService.getScriptLock()` so simultaneous requests from a full class of students (each doing a find-row-then-update) can't race each other into duplicate or lost rows.

### Deploying it

1. Paste `Code.gs`'s contents into the Apps Script editor, save.
2. **Deploy → New deployment** (first time) or **Deploy → Manage deployments → pencil icon → Version: New version** (any time after editing the code). This second point matters a lot: **editing the script does nothing to the live URL until you deploy a new version.** This tripped things up more than once during setup.
3. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy, authorize when prompted.
4. Copy the `.../exec` URL — that's the `appsScriptUrl` every game's HTML needs.

### Confirming your school's Google Workspace allows this

Some school Google Workspace admins block "Anyone" (fully anonymous) access to Apps Script web apps. Test before building anything real on it: deploy a throwaway script whose `doGet` just returns `"ok"`, set access to Anyone, then open the URL from an incognito window or a device with no Google account signed in. Seeing "ok" confirms anonymous access works.

## 5. `engine.js` — what it gives every game for free

A game's HTML includes it (`<script src="../engine.js"></script>`) and configures it once:

```js
Engine.configure({
  appsScriptUrl: "https://script.google.com/macros/s/XXXXX/exec",
  gameType: "skew-the-feed"   // unique per game — keeps each game's scores/history separate
});
```

What's available after that:

- **`Engine.identity`** — student-ID login, no accounts. `Engine.identity.lookup(id)` checks the typed ID against the `Students` roster and, on success, caches `studentId`/`displayName`/`period` (in `localStorage`, so a returning student on the same device skips re-typing it — though they still need to re-enter it if the game requires re-verifying the game code). `Engine.identity.isLoggedIn()` checks whether that's already populated.
- **`Engine.session`** — game codes and timing. `createGame(retireCode?)` generates a 4-character code (avoiding visually ambiguous characters: no `0/O/1/I/L`) and creates the `Games` row; pass the outgoing code as `retireCode` when deliberately switching games so the backend retires it in the same write — `host.html` does this only from "Start a different game (new code)", never from a plain "Start Round". `checkCode(code)` verifies a code exists and is not retired. `startPolling(code, intervalMs, onUpdate)` polls `getGame` and calls `onUpdate` with the latest game object (or `null` if the code doesn't exist). It reschedules itself *after* each response rather than on a fixed interval, so a slow backend backs off instead of stacking overlapping requests, and it adds up to 600ms of random jitter per tick so a class of tabs opened within the same minute doesn't phase-lock into synchronized bursts. `startRound(code, minutes)` and `endRound(code)` write new timing — both also update the *caller's own* local copy of the game state synchronously and return it, so the person clicking the button sees their own dashboard react instantly rather than waiting on a round trip. A poll already in flight when that happens can return the pre-write row; the engine tracks a local write watermark and refuses to apply a response that would move `round`/`startedAt` backward within 15s of one of our own writes. `derivePhase(game)` returns `"idle" | "countdown" | "live" | "ended"` purely from comparing `Date.now()` against the game's stored timestamps.
- **`Engine.players`** — `pushProgress(fields)` upserts a live `Players` row; `saveRun(payload)` appends a permanent `Runs` row; `getPlayers(code, round)` reads the live scoreboard.
- **`Engine.leaderboard.get(opts)`** — reads `Runs`. `opts` can be a plain number (legacy: just a limit), or `{limit, code, round}`.
- **`Engine.round`** — the student-side local clock (added September 2026, see the timing model below). `plan(game)` takes the game row a poll just handed us and decides how *this* device should run the round, returning `{round, countdownEnd, playEnd, late, secondsAvailable}` or `null` if there's nothing to join. `runCountdown(countdownEnd, onTick, onDone)` runs a purely local countdown with no network in the loop and returns a handle with `.cancel()`.
- **`Engine.ui`** — small rendering helpers: `maskHtml(countdownEnd, kicker, sub)` for the countdown overlay (note: takes the device's own local countdown end, **not** a game object), `setMaskNum(n)` to tick its number with a restarted CSS pop animation, `scoreboardTableHtml(rows, columns)` for a generic ranked table.

A new game's own HTML owns everything about *what the game actually is* — content, scoring rules, the play screen — and just calls into `Engine` for identity and sync.

## 6. Running a game (host workflow)

1. Open the game's `host.html` on the classroom computer/projector.
2. Click **Generate Game Code** — a 4-character code appears, large and monospace, meant to be projected.
3. Students open the game's student link (e.g. `.../skew-the-feed/`), enter that code plus their own student ID, and land in a waiting lobby.
4. On the host dashboard, set the round length (minutes) and click **Start Round**. Each device runs its own 5-second countdown starting the moment it hears about the round, then plays the full length you set. Devices that join after the countdown window has passed skip the countdown and get whatever time is left on the room clock. See the timing model below.
5. **End Round Now** force-ends a round early if needed.
6. Once a round ends, **Show Round Results** opens a dedicated podium-style results screen (top 3 highlighted, rest ranked below) meant to be left projected. It first shows a short tabulating animation — that isn't decoration, it's the window in which the last students' `saveRun` writes land, so nobody gets left off the podium. It stops as soon as the scoreboard stops changing (min 2.6s, hard cap 9s). **Start Next Round** is on that screen too.
7. **View history** on the dashboard has three tabs: **This Round** (the round that just ended), **This Game** (every round played under the current code), **All Games** (all-time across every code ever run for this game).
8. **Start a different game (new code)** retires the current code and generates a fresh one — use this for a new class period. Retiring is immediate and active: students still on the old code get bounced back to registration within a poll cycle (1.5s) with "Your teacher started a new game," rather than sitting in a lobby that will never start. Starting another round on the *same* code (steps 4/6) never does this.

## 7. Creating a new game on this platform

1. Make a new folder at the repo root, e.g. `/new-game-name/`.
2. Copy `skew-the-feed/index.html` and `host.html` as a starting template.
3. Change `gameType` in both files' `Engine.configure(...)` call to something unique (e.g. `"new-game-name"`) — this is what keeps its scores and history separate from every other game sharing the same Sheet.
4. Replace the content bank, scoring rules, and play-screen UI with the new game's actual content. Everything about identity, game codes, the countdown, and score syncing keeps working unchanged because it's coming from `engine.js`.
5. Add a card for it on the root `index.html` landing page.
6. No changes needed to `Code.gs` or the Sheet's tab structure — a new `gameType` value is all that's needed to keep it separate; rows for different games simply coexist in the same `Games`/`Players`/`Runs` tabs.

## 8. Troubleshooting — problems actually hit while building this

**Blank page, nothing renders at all.** Almost always `engine.js` failing to load, which silently kills the rest of the page's script. Check the exact relative path in `<script src="...">` against where the HTML file actually sits relative to `engine.js` (see §2's `../` rule).

**Dashboard stuck forever on "Loading…".** This means the page's poll to `getGame` never gets back something it can use. In order of likelihood:
1. `appsScriptUrl` in that file's `Engine.configure(...)` is still the placeholder text or otherwise wrong — check the Network tab for a request going somewhere obviously broken (like your own GitHub Pages domain instead of `script.google.com`).
2. The Apps Script deployment needs re-authorization or a fresh "new version" deploy.
3. A stale game code saved in that browser's `localStorage` from earlier testing is confusing things — test in an incognito window to rule this out.
4. A full class opening the page at the same moment is overloading the shared Apps Script backend (see §9) — as of the September 2026 `engine.js` update, `host.html` now paints from its last cached game state immediately instead of blocking on this, and requests time out instead of hanging forever, but a genuinely overloaded backend will still be slow to give a fresh answer.

**Diagnosing the backend directly**, independent of any page's JavaScript: open this directly in a browser tab (it's a plain GET):
```
https://script.google.com/macros/s/YOUR_ID/exec?action=getGame&code=SOMECODE
```
Clean JSON back means the backend itself is healthy and any remaining problem is in a specific page's code/config. A Google sign-in page or "needs authorization" page means the deployment needs fixing (re-authorize or new-version deploy). A raw Apps Script error/stack trace means something's actually broken in `Code.gs`, or a Sheet tab is missing/misnamed.

**"Couldn't create the game" / a write silently fails.** Same root causes as above, but specific to the `POST` calls. Check the Network tab for the actual request/response — a HAR export (browser DevTools → Network tab → right-click → Save All As HAR, or the export button) is the most useful thing to capture and inspect if this needs deeper debugging. As of the September 2026 update, `host.html`'s start/end-round buttons no longer fail silently — a banner with a **Retry** button appears if the write couldn't be confirmed after retrying.

**Why POST bodies are sent as `Content-Type: text/plain`, not `application/json`.** Apps Script web apps have no CORS preflight handler. A `fetch` POST with an `application/json` content-type triggers a browser preflight (`OPTIONS`) request that Apps Script can't answer, and the real request never goes through. Sending as `text/plain` keeps it a CORS "simple request" that skips preflight entirely — Apps Script doesn't care about the declared content-type, it just reads and `JSON.parse`s the raw body either way.

**A slow or out-of-order poll response briefly shows stale data.** `engine.js`'s polling guards against this with a rising sequence number — a response is only applied if no newer request has already completed. If this ever regresses, that's the mechanism to look at (`pollSeq` in `engine.js`).

## 9. Known limits, worth remembering

- **Polling, not push.** Everything is fetched on a timer, not pushed instantly. As of the timing-model change below, the *only* two things a student device still needs the network for mid-round are hearing that a round started and hearing that the host force-ended one. Everything between those two moments runs off the local clock, so backend latency no longer shows up as visible lag. The one irreducible hop is the start announcement itself, and the local countdown absorbs it.
- **Apps Script latency.** Each request typically takes 1-2.5 seconds round-trip, sometimes longer on a cold start after inactivity. Fine for a classroom's pace of use, but not instant.
- **Apps Script has a real concurrency ceiling.** A full class (25-35 devices) all polling the same single Apps Script deployment adds up fast, especially with everyone opening the link at the same moment at the start of class. Under that load, round-trip time can spike well past the normal 1-2.5s, or a request can hang outright. Two symptoms traced back to this in September 2026: `host.html` sitting on "Loading…" for a long time on open, and a started round not actually reaching students (the host's own screen showed it as started from the optimistic local update, but the write that makes it real for everyone else silently failed and nothing said so). `engine.js`'s resilience changes (below) reduce how often this bites and make it visible when it does, but the underlying ceiling is still there.
- **Sheet size over time.** Everything (roster, live game state, all-time history) lives in one Sheet. If `Runs` grows very large over a school year, consider periodically archiving old rows into a second tab — no code changes needed to do this.
- **Never displayed on shared screens:** raw student ID numbers. Only `display_name` should ever appear on a projected view.
- **Stale cached codes.** `skew-the-feed/index.html` caches its game code in `localStorage` with a timestamp and only auto-resumes into the lobby if it's under 4 hours old; older than that, or explicit `retired: true` from the backend (host clicked "Start a different game"), bounces the student back to registration instead of leaving them polling a code that will never start. A "Switch game code" link on the briefing/lobby screens covers the gap in between (e.g. two periods getting fresh codes within the same few hours).

### Client-side resilience in `engine.js` (added September 2026)

**Accuracy note:** an earlier revision of this document described `REQUEST_TIMEOUT_MS`/`AbortController` timeouts, a `withRetry` helper, `{onSuccess, onError}` callbacks on `startRound`/`endRound`, `Engine.session.retryFailedWrite()`, a "couldn't confirm with the server" banner with a Retry button, and `host.html` caching game state to `localStorage`. **None of that is in the code.** It was either planned and never written or written and never committed. It's all still worth doing — the failure mode it addresses (a start-round write silently failing while the host's optimistic local update makes their own screen look fine) is real and still unhandled. Treat it as a TODO, not as existing behaviour.

What the code *does* do:

- `startPolling` reschedules itself after each response instead of using a fixed `setInterval`, so a slow backend backs off rather than stacking overlapping requests, and adds up to 600ms of jitter per tick to break up synchronized bursts from a class opening the link at once.
- Poll intervals: `host.html` 3s (it originates round state, so it barely needs to read it back), `index.html` 1.5s. Both were previously 1s.
- A rising `pollSeq` drops stale out-of-order responses, and a local write watermark stops an in-flight poll from undoing the host's own optimistic start/end.
- `index.html` coalesces live-score writes to one every 5s instead of firing one per answer. Each of those writes takes a script lock, and a class mid-round was previously generating several per second. The host's scoreboard refreshes every 15s anyway, so nothing visible is lost.
- `index.html` only polls the leaderboard on the screens that show it. It used to run every 15s on every device including mid-round.

### Timing model (changed September 2026)

The original design had every device count down to a single shared `countdownEndsAt` and play to a single shared `gameEndsAt`. That made backend latency directly visible: a device that heard about the round 3 seconds late saw a 2-second countdown and lost 3 seconds of play time, and the countdown number only advanced when a poll happened to return, so it visibly stuttered and skipped.

Now the network's job ends at the announcement:

- **On-time joiner** (heard while `now < countdownEndsAt`): runs its *own* 5-second countdown from the moment it heard, then plays the full `durationSec`. Nothing in that path touches the network, so the countdown animates smoothly no matter how congested the backend is.
- **Late joiner** (heard after the countdown window): skips the countdown entirely — a fake "5, 4, 3" for a round already in progress is more confusing than just landing on the first item — and plays to the room's shared `gameEndsAt`. Join a 5-minute round a minute late, get 4 minutes.
- **Host force-end** still reaches everyone: `gameEndsAt` jumps backward from what the device was told at join time, and the student page clamps its local end to it immediately rather than waiting for its next 1s tick. A 1s slack threshold keeps ordinary poll noise from tripping it.
- **The host clock is local too.** `derivePhase` and the clock text are pure functions of `Date.now()` against timestamps already in hand, so `host.html` ticks them at 4fps off a local interval. Polling only delivers state the host didn't originate.

The cost: on-time devices finish a second or two apart rather than in lockstep, and the host's projected clock is nominal rather than exact. The tabulating screen covers the first; the second doesn't matter for a pacing aid on a projector.

Deliberate consequence worth knowing about: a student who joins with 10 seconds left plays a 10-second round, and that score lands in `Runs` next to full-length runs. The student's results screen says so explicitly, but the all-time leaderboard doesn't distinguish them. If that becomes annoying, either show duration alongside score in the history table or set a minimum joinable remaining time.
