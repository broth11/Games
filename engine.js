/**
 * engine.js — shared classroom-game engine
 * ---------------------------------------------------------
 * Talks to the Apps Script + Google Sheet backend so any game built on
 * top of this file gets, for free: student-ID identity (no accounts),
 * game codes, a host-controlled round with a LOCAL lag-free countdown,
 * and a live scoreboard / all-time leaderboard.
 *
 * TIMING MODEL (changed September 2026 — see PROJECT-HANDOFF.md §5)
 * ---------------------------------------------------------
 * Previously every device counted down to a single shared timestamp, so
 * a device that heard about the round late saw a truncated countdown and
 * a shortened round. Now:
 *
 *   - A device that hears while the round is still in its countdown
 *     window runs its OWN 5s countdown from the moment it heard, then
 *     plays the full durationSec. Nothing in that path touches the
 *     network, so the countdown animation is perfectly smooth no matter
 *     how congested the backend is.
 *   - A device that hears after the countdown window (a late joiner)
 *     skips the countdown and plays whatever time is left on the room's
 *     shared clock — join a 5-minute round a minute late, get 4 minutes.
 *
 * The cost is that on-time devices finish a second or two apart rather
 * than in lockstep. That's covered by the host's tabulating screen.
 */
(function (global) {
  "use strict";

  var CONFIG = { appsScriptUrl: "", gameType: "" };
  var COUNTDOWN_MS = 5000;
  var CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

  function configure(opts) {
    CONFIG.appsScriptUrl = opts.appsScriptUrl;
    CONFIG.gameType = opts.gameType;
  }

  function generateCode() {
    var out = "";
    for (var i = 0; i < 4; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return out;
  }

  /* ---------------------------------------------------------------
     API — GET/POST against the Apps Script web app.
     POST uses text/plain to stay a CORS "simple request" (Apps Script
     has no OPTIONS/preflight handler, so a JSON content-type would
     otherwise be blocked by the browser before it ever leaves).
  ----------------------------------------------------------------*/
  function apiGet(action, params) {
    var url = CONFIG.appsScriptUrl + "?action=" + encodeURIComponent(action);
    if (params) {
      Object.keys(params).forEach(function (k) {
        if (params[k] !== undefined && params[k] !== null) {
          url += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
        }
      });
    }
    return fetch(url).then(function (r) { return r.json(); });
  }

  function apiPost(action, body) {
    var payload = Object.assign({ action: action }, body || {});
    return fetch(CONFIG.appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  /* ---------------------------------------------------------------
     IDENTITY — student ID is the login, no accounts.
  ----------------------------------------------------------------*/
  var LS_PREFIX = "engine_";
  function lsGet(k) { try { return localStorage.getItem(LS_PREFIX + k) || ""; } catch (e) { return ""; } }
  function lsSet(k, v) { try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {} }
  function lsClear(k) { try { localStorage.removeItem(LS_PREFIX + k); } catch (e) {} }

  var identity = {
    studentId: lsGet("studentId"),
    displayName: lsGet("displayName"),
    period: lsGet("period"),

    isLoggedIn: function () { return !!(identity.studentId && identity.displayName); },

    lookup: function (id) {
      return apiGet("getStudent", { id: id }).then(function (res) {
        if (res && res.found) {
          identity.studentId = res.studentId;
          identity.displayName = res.displayName;
          identity.period = res.period;
          lsSet("studentId", res.studentId);
          lsSet("displayName", res.displayName);
          lsSet("period", res.period);
        }
        return res;
      });
    },

    logout: function () {
      identity.studentId = ""; identity.displayName = ""; identity.period = "";
      lsClear("studentId"); lsClear("displayName"); lsClear("period");
    }
  };

  /* ---------------------------------------------------------------
     SESSION
  ----------------------------------------------------------------*/
  var pollTimer = null;
  var currentGame = null;
  var localWriteAt = 0; // wall-clock of our own last start/end write

  function derivePhase(game) {
    if (!game || !game.exists || !game.gameEndsAt) return "idle";
    var now = Date.now();
    if (now < game.countdownEndsAt) return "countdown";
    if (now < game.gameEndsAt) return "live";
    return "ended";
  }

  // retireCode is optional — pass the CURRENT code when the host is
  // deliberately switching games ("new code" action) so the backend
  // marks it dead in the same write that creates the new one. Omit it
  // for the very first code of a session, where there's nothing to
  // retire yet.
  function createGame(retireCode) {
    var code = generateCode();
    var body = { code: code, gameType: CONFIG.gameType };
    if (retireCode) body.retireCode = retireCode;
    return apiPost("createGame", body).then(function (res) {
      if (res && res.error === "code_exists") return createGame(retireCode);
      if (res && res.ok) return code;
      throw new Error((res && res.error) || "create_failed");
    });
  }

  function checkCode(code) {
    return apiGet("getGame", { code: code }).then(function (game) {
      return !!(game && game.exists && !game.retired);
    });
  }

  // Responses can arrive out of order (Apps Script round-trips run
  // 1-2.5s). Each tick gets a rising sequence number; a response is
  // applied only if it's still the most recent request in flight.
  var pollSeq = 0;

  // Would applying `next` move us BACKWARD relative to a write we just
  // made ourselves? The host writes optimistically and locally before
  // the network confirms, so a poll already in flight can come back
  // carrying the pre-write row and briefly undo the host's own click.
  function isStaleAgainstLocalWrite(next) {
    if (!next || !currentGame || !localWriteAt) return false;
    if (Date.now() - localWriteAt > 15000) return false; // long settled by now
    if (next.round < currentGame.round) return true;
    if (next.round === currentGame.round &&
        (next.startedAt || 0) < (currentGame.startedAt || 0)) return true;
    return false;
  }

  // Self-rescheduling rather than setInterval, so the gap is measured
  // BETWEEN responses — a slow backend naturally backs off instead of
  // stacking overlapping requests. The random jitter keeps 30 tabs
  // opened in the same 20 seconds from phase-locking into synchronized
  // bursts against a backend with a real concurrency ceiling.
  // A retired code (see createGame's retireCode) still `exists` in the
  // sheet — it's just marked dead by the host's OWN move to a different
  // code, as opposed to simply never having been created. onUpdate's
  // second argument distinguishes the two so a caller (a student page)
  // can tell "this code was never valid" apart from "your teacher moved
  // everyone to a new code" and say something more useful than generic.
  function startPolling(code, intervalMs, onUpdate) {
    stopPolling();
    var base = intervalMs || 2000;
    function tick() {
      var mySeq = ++pollSeq;
      apiGet("getGame", { code: code }).then(function (game) {
        if (mySeq !== pollSeq) return;
        var retired = !!(game && game.retired);
        var next = (game && game.exists && !retired) ? game : null;
        if (isStaleAgainstLocalWrite(next)) { onUpdate(currentGame, { retired: false }); return; }
        currentGame = next;
        onUpdate(currentGame, { retired: retired });
      }).catch(function () { /* transient hiccup — next tick retries */ })
        .then(function () {
          pollTimer = setTimeout(tick, base + Math.random() * 600);
        });
    }
    tick();
  }

  function stopPolling() {
    if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  }

  // Takes effect on the CALLER's screen immediately — currentGame is
  // updated synchronously, before the network write resolves — so the
  // host never watches their own dashboard wait on a poll.
  function startRound(code, minutes) {
    var durationSec = Math.round(minutes * 60);
    var now = Date.now();
    var countdownEndsAt = now + COUNTDOWN_MS;
    var gameEndsAt = countdownEndsAt + durationSec * 1000;
    var round = (currentGame && currentGame.round ? currentGame.round : 0) + 1;
    localWriteAt = now;
    currentGame = {
      exists: true, code: code, gameType: CONFIG.gameType, round: round,
      durationSec: durationSec, countdownEndsAt: countdownEndsAt, gameEndsAt: gameEndsAt, startedAt: now
    };
    apiPost("startRound", {
      code: code, round: round, durationSec: durationSec,
      countdownEndsAt: countdownEndsAt, gameEndsAt: gameEndsAt
    }).catch(function () {});
    return currentGame;
  }

  function endRound(code) {
    var now = Date.now();
    localWriteAt = now;
    if (currentGame) {
      currentGame = Object.assign({}, currentGame, {
        gameEndsAt: now,
        countdownEndsAt: Math.min(currentGame.countdownEndsAt || now, now)
      });
    }
    apiPost("endRound", { code: code }).catch(function () {});
    return currentGame;
  }

  /* ---------------------------------------------------------------
     ROUND — the student-side local clock. Any game can reuse this.

     plan(game) decides, from the game row a poll just handed us, how
     THIS device should run the round. Returns null if there's nothing
     to join, otherwise:
       { round, countdownEnd, playEnd, late, secondsAvailable }
     countdownEnd === 0 means "no countdown, start immediately".
  ----------------------------------------------------------------*/
  function planRound(game) {
    if (!game || !game.exists || !game.gameEndsAt) return null;
    var now = Date.now();
    if (now >= game.gameEndsAt) return null; // round's over

    if (now < game.countdownEndsAt) {
      // Heard in time — our own clean countdown, then the full duration.
      var cd = now + COUNTDOWN_MS;
      return {
        round: game.round,
        countdownEnd: cd,
        playEnd: cd + game.durationSec * 1000,
        late: false,
        secondsAvailable: game.durationSec
      };
    }

    // Late joiner — no countdown, share the room's finish line.
    return {
      round: game.round,
      countdownEnd: 0,
      playEnd: game.gameEndsAt,
      late: true,
      secondsAvailable: Math.max(0, Math.round((game.gameEndsAt - now) / 1000))
    };
  }

  // Runs a purely local countdown. No network in the loop, so the
  // animation is smooth regardless of backend latency. Calls onTick(n)
  // each time the whole-second number changes, then onDone().
  function runCountdown(countdownEnd, onTick, onDone) {
    var last = null;
    var id = setInterval(function () {
      var left = Math.ceil((countdownEnd - Date.now()) / 1000);
      if (left <= 0) { clearInterval(id); if (onDone) onDone(); return; }
      if (left !== last) { last = left; if (onTick) onTick(left); }
    }, 80);
    var first = Math.ceil((countdownEnd - Date.now()) / 1000);
    if (first > 0 && onTick) { last = first; onTick(first); }
    return { cancel: function () { clearInterval(id); } };
  }

  /* ---------------------------------------------------------------
     PLAYERS
  ----------------------------------------------------------------*/
  function pushProgress(fields) {
    return apiPost("updatePlayer", Object.assign({ gameType: CONFIG.gameType }, fields)).catch(function () {});
  }

  function saveRun(payload) {
    return apiPost("saveRun", Object.assign({ gameType: CONFIG.gameType, ts: Date.now() }, payload)).catch(function () {});
  }

  function getPlayers(code, round) {
    return apiGet("getPlayers", { code: code, round: round });
  }

  function getLeaderboard(opts) {
    var o = (typeof opts === "number") ? { limit: opts } : (opts || {});
    return apiGet("getLeaderboard", {
      gameType: CONFIG.gameType, limit: o.limit || 100, code: o.code, round: o.round
    });
  }

  /* ---------------------------------------------------------------
     UI HELPERS
  ----------------------------------------------------------------*/
  // `countdownEnd` here is the device's OWN local countdown end, not
  // the game row's shared timestamp.
  function maskHtml(countdownEnd, kicker, sub) {
    var end = countdownEnd || 0;
    var remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    return (
      '<div class="mask" id="countMask">' +
        '<div class="mask-kicker">' + (kicker || "Starting in") + '</div>' +
        '<div class="mask-num mono pop" id="maskNum">' + remaining + '</div>' +
        '<div class="mask-sub">' + (sub || "") + '</div>' +
      '</div>'
    );
  }

  function setMaskNum(n) {
    var el = document.getElementById("maskNum");
    if (!el) return;
    el.textContent = n;
    el.classList.remove("pop");
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add("pop");
  }

  function scoreboardTableHtml(rows, columns) {
    if (!rows || !rows.length) return '<div class="lb-empty">No scores reported yet.</div>';
    var head = '<th>#</th>' + columns.map(function (c) {
      return '<th' + (c.numeric ? ' class="num"' : '') + '>' + c.label + '</th>';
    }).join("");
    var body = rows.map(function (r, i) {
      var badgeCls = "rank-badge" + (i < 3 ? " top" : "");
      var cells = columns.map(function (c) {
        var v = r[c.key];
        return '<td' + (c.numeric ? ' class="num"' : '') + '>' + (v === undefined || v === null || v === "" ? "&mdash;" : v) + '</td>';
      }).join("");
      return '<tr><td><span class="' + badgeCls + '">' + (i + 1) + '</span></td>' + cells + '</tr>';
    }).join("");
    return '<div style="overflow-x:auto;"><table class="lb"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  global.Engine = {
    configure: configure,
    generateCode: generateCode,
    COUNTDOWN_MS: COUNTDOWN_MS,
    api: { get: apiGet, post: apiPost },
    identity: identity,
    session: {
      derivePhase: derivePhase,
      createGame: createGame,
      checkCode: checkCode,
      startPolling: startPolling,
      stopPolling: stopPolling,
      startRound: startRound,
      endRound: endRound,
      getCurrent: function () { return currentGame; }
    },
    round: {
      plan: planRound,
      runCountdown: runCountdown
    },
    players: {
      pushProgress: pushProgress,
      saveRun: saveRun,
      getPlayers: getPlayers
    },
    leaderboard: { get: getLeaderboard },
    ui: { maskHtml: maskHtml, setMaskNum: setMaskNum, scoreboardTableHtml: scoreboardTableHtml }
  };
})(window);
