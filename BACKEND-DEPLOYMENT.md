# Apps Script deployment status

The classroom pages continue to use the existing Apps Script web-app URL in
`config.js`. The front end keeps the deployed API's existing actions, request
fields, Sheet tab names, and column order, so this static-site release does not
require a backend deployment to preserve current behavior.

`backend/Code.gs` is a reviewed, compatible backend update. It adds server-side
idempotency for final `saveRun` writes, validates round timing, makes repeated
`startRound` requests idempotent, and rejects retired-room writes. It does not
require a Sheet migration.

This repository cannot deploy a container-bound Apps Script project by itself:
there is no Apps Script project ID, `appsscript.json`, or authenticated `clasp`
configuration here. Committing this file therefore does **not** change the live
backend. Until it is manually deployed, the front end still reduces duplicate
final saves by checking the round leaderboard before retrying, but only the
backend update can make concurrent saves atomically duplicate-safe.

To deploy the stronger backend safely:

1. Open the Google Sheet used by the configured web app, then choose
   **Extensions → Apps Script**.
2. Back up the current script. Replace its `Code.gs` with this repository's
   `backend/Code.gs`, then save.
3. Choose **Deploy → Manage deployments**, edit the existing web-app deployment,
   select **New version**, and deploy. Keep **Execute as: Me** and the existing
   anonymous classroom access setting so the `/exec` URL does not change.
4. Verify the existing `/exec` URL still returns JSON for `getGame`, then run an
   isolated test room before using it with a class. Do not test save writes
   against classroom records.
