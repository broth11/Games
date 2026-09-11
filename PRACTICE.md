# Untimed practice

Every student game supports an independent practice URL. Practice never requires a room code or roster ID, never polls a classroom session, and never sends presence, progress, score, or leaderboard data. Existing saved classroom identity and room-code data are ignored.

| Game | Practice URL | Available content selector |
| --- | --- | --- |
| Spot the Error | `spot-the-error/index.html?practice=1` | All content or the authored `ruleType`: power, product, quotient, chain, trigonometric, exponential/logarithmic, or conceptual |
| Double-Blind | `double-blind/index.html?practice=1` | All content or authored difficulty tier 1, 2, or 3 |
| Skew the Feed | `skew-the-feed/index.html?practice=1` | All content or the authored bias category: undercoverage, nonresponse, voluntary response, wording/response, or no bias |
| Plot Twist | `plot-twist/index.html?practice=1` | All Unit 1A + 1B content or the authored lesson |

Practice is finite. It shows item progress, keeps feedback visible until the student advances, prevents a response from being scored twice, and ends with correct answers, attempts, accuracy, and missed topics where the bank supports them. Practice points are local, have no speed bonus, and are never submitted.

## Mapping limitations

- Double-Blind's question bank has `tier` and interaction `kind`, but no lesson or curriculum-topic field. Its selector therefore uses the authored tiers; build fields remain together, and each two-stage showdown stays together. Showdowns include authored prose explanations. Build cards do not have a separate authored explanation field, so practice shows the authored correct methodology fields after a miss.
- Spot the Error uses the bank's authored `ruleType`. Each problem's locate-and-classify stages remain one item.
- Skew the Feed uses the bank's authored `cat` category. Each post and its explanation remain one item.
- Plot Twist already provides authored lesson metadata and keeps each three-question evidence ladder together.

The timed classroom and teacher-host URLs are unchanged. Practice is intentionally silent; classroom host audio remains host-only.
