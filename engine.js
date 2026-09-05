/**
 * engine.js — shared classroom-game engine
 * ---------------------------------------------------------
 * Talks to the Apps Script + Google Sheet backend so any game built on
 * top of this file gets, for free: student-ID identity (no accounts),
 * game codes, a host-controlled synchronized countdown + round timer,
 * and a live scoreboard / all-time leaderboard.
 *
 * A game page includes this file, calls Engine.configure(...) once,
 * then uses Engine.identity / Engine.session / Engine.players /
 * Engine.leaderboard. The game itself owns its content, scoring rules,
 * and play-screen UI — this file only owns sync + identity.
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

     A classroom-scale load (a whole class polling the same Apps
     Script deployment once a second) can push its 1-2.5s normal
     round trip much higher, or make it hang outright on a cold
     start. Two things guard against that:
       - REQUEST_TIMEOUT_MS aborts any single request that takes too
         long, instead of leaving it to hang forever with nothing
         ever resolving.
       - withRetry() gives one-shot calls (login lookup, create game,
         start/end round) a few attempts with backoff before giving
         up, instead of failing silently on the first hiccup.
     Steady polling deliberately opts OUT of retries (see
     startPolling below) — the next tick a second later already
     serves as the retry, so stacking retries on top of that would
     only add more concurrent load to an already-overloaded backend.
  ----------------------------------------------------------------*/
  var REQUEST_TIMEOUT_MS = 7000;
  var DEFAULT_RETRIES = 2;      // up to 3 attempts total
  var RETRY_BASE_DELAY_MS = 600;

  function fetchJson(url, fetchOpts) {
    var controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS) : null;
    var opts = Object.assign({}, fetchOpts || {});
    if (controller) opts.signal = controller.signal;
    return fetch(url, opts).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error("http_" + r.status);
      return r.json();
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function delay(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  function withRetry(fn, retries, attempt) {
    attempt = attempt || 0;
    return fn().catch(function (err) {
      if (attempt >= retries) throw err;
      return delay(RETRY_BASE_DELAY_MS * Math.pow(1.8, attempt)).then(function () {
        return withRetry(fn, retries, attempt + 1);
      });
    });
  }

  function apiGet(action, params, opts) {
    opts = opts || {};
    var retries = (opts.retries != null) ? opts.retries : DEFAULT_RETRIES;
    var url = CONFIG.appsScriptUrl + "?action=" + encodeURIComponent(action);
    if (params) {
      Object.keys(params).forEach(function (k) {
        if (params[k] !== undefined && params[k] !== null) {
          url += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
        }
      });
    }
    return withRetry(function () { return fetchJson(url); }, retries);
  }

  function apiPost(action, body, opts) {
    opts = opts || {};
    var retries = (opts.retries != null) ? opts.retries : DEFAULT_RETRIES;
    var payload = Object.assign({ action: action }, body || {});
    return withRetry(function () {
      return fetchJson(CONFIG.appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    }, retries);
  }

  // Wraps a write so a caller can be told definitively whether it
  // landed, and — if every retry is exhausted — can offer the user a
  // manual "Retry" that resends the exact same payload rather than
  // recomputing one (recomputing timestamps on retry is how a
  // "double start" bug would sneak in).
  var lastFailedWrite = null; // {action, body}

  function writeWithRetry(action, body) {
    return apiPost(action, body).then(function (res) {
      lastFailedWrite = null;
      return res;
    }, function (err) {
      lastFailedWrite = { action: action, body: body };
      throw err;
    });
  }

  function retryFailedWrite(callbacks) {
    callbacks = callbacks || {};
    if (!lastFailedWrite) return;
    var w = lastFailedWrite;
    writeWithRetry(w.action, w.body).then(function (res) {
      if (callbacks.onSuccess) callbacks.onSuccess(res);
    }, function (err) {
      if (callbacks.onError) callbacks.onError(err);
    });
  }

  /* ---------------------------------------------------------------
     IDENTITY — student ID is the login, no accounts. Once looked up
     against the roster, the result is cached in localStorage so
     returning on the same device is instant; the ID is always what's
     typed and stored, never displayed back on a shared screen.
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

    // Looks up a typed ID against the Students roster tab. Resolves
    // {found:true, displayName, period} or {found:false}.
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
     SESSION — a "games/{code}" row. Phase is derived purely from
     wall-clock comparisons against stored absolute timestamps, so
     every device (including a late joiner or a reload) agrees on
     the phase independently — no push events needed.
  ----------------------------------------------------------------*/
  var pollTimer = null;
  var currentGame = null; // last known {exists, code, round, durationSec, countdownEndsAt, gameEndsAt}

  function derivePhase(game) {
    if (!game || !game.exists || !game.gameEndsAt) return "idle";
    var now = Date.now();
    if (now < game.countdownEndsAt) return "countdown";
    if (now < game.gameEndsAt) return "live";
    return "ended";
  }

  function createGame() {
    var code = generateCode();
    return apiPost("createGame", { code: code, gameType: CONFIG.gameType }).then(function (res) {
      if (res && res.error === "code_exists") return createGame(); // retry on the rare collision
      if (res && res.ok) return code;
      throw new Error((res && res.error) || "create_failed");
    });
  }

  function checkCode(code) {
    return apiGet("getGame", { code: code }).then(function (game) {
      return game && game.exists;
    });
  }

  // Apps Script round-trips run 1-2.5s, which is slower than a 1s poll
  // interval — so responses CAN arrive out of order (a slow response to an
  // older request landing after a faster response to a newer one). Each
  // tick gets a rising sequence number; a response is applied only if it's
  // still the most recent request in flight, so a late straggler can never
  // overwrite fresher state.
  var pollSeq = 0;

  function startPolling(code, intervalMs, onUpdate) {
    stopPolling();
    function tick() {
      var mySeq = ++pollSeq;
      // retries:0 — the next tick a couple seconds from now IS the retry;
      // stacking real retries on top of the poll loop would only pile
      // more concurrent requests onto a backend that's already slow.
      apiGet("getGame", { code: code }, { retries: 0 }).then(function (game) {
        if (mySeq !== pollSeq) return; // a newer request already finished — drop this stale one
        currentGame = game && game.exists ? game : null;
        onUpdate(currentGame);
      }).catch(function () { /* transient network hiccup — next tick retries */ });
    }
    tick();
    pollTimer = setInterval(tick, intervalMs || 2500);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  // Both take effect on the CALLER's screen immediately (currentGame is
  // updated synchronously, before the network write even resolves) so the
  // host never has to sit and watch their own dashboard wait on a poll to
  // reflect a button they just pressed. Other devices still learn about it
  // on their next poll — that hop can't be eliminated without a push
  // channel, which Apps Script doesn't offer — but the local wall-clock
  // math means everyone still converges on the exact same start/end
  // instant once they do hear about it, they just may join the countdown
  // already a beat or two in rather than always seeing a clean "5".
  // `callbacks` is optional: {onSuccess(res), onError(err)}. The local
  // currentGame update and return happen synchronously either way (so the
  // host's own screen still reacts instantly), but now the caller can
  // also find out — after a few retries — whether the write that makes
  // it real for every OTHER device actually landed, instead of that
  // failure being swallowed silently.
  function startRound(code, minutes, callbacks) {
    callbacks = callbacks || {};
    var durationSec = Math.round(minutes * 60);
    var now = Date.now();
    var countdownEndsAt = now + COUNTDOWN_MS;
    var gameEndsAt = countdownEndsAt + durationSec * 1000;
    var round = (currentGame && currentGame.round ? currentGame.round : 0) + 1;
    currentGame = {
      exists: true, code: code, gameType: CONFIG.gameType, round: round,
      durationSec: durationSec, countdownEndsAt: countdownEndsAt, gameEndsAt: gameEndsAt, startedAt: now
    };
    writeWithRetry("startRound", {
      code: code, round: round, durationSec: durationSec,
      countdownEndsAt: countdownEndsAt, gameEndsAt: gameEndsAt
    }).then(function (res) {
      if (callbacks.onSuccess) callbacks.onSuccess(res);
    }, function (err) {
      if (callbacks.onError) callbacks.onError(err);
    });
    return currentGame;
  }

  function endRound(code, callbacks) {
    callbacks = callbacks || {};
    var now = Date.now();
    if (currentGame) {
      currentGame = Object.assign({}, currentGame, {
        gameEndsAt: now,
        countdownEndsAt: Math.min(currentGame.countdownEndsAt || now, now)
      });
    }
    writeWithRetry("endRound", { code: code }).then(function (res) {
      if (callbacks.onSuccess) callbacks.onSuccess(res);
    }, function (err) {
      if (callbacks.onError) callbacks.onError(err);
    });
    return currentGame;
  }

  /* ---------------------------------------------------------------
     PLAYERS — per-round progress (for the host's live scoreboard)
     and final Runs (for the all-time leaderboard).
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

  // Accepts either a plain number (legacy — just a limit) or an options
  // object: {limit, code, round}. Omitting code/round returns the
  // all-time board across every game code ever played for this gameType;
  // passing code narrows to one game's history; passing code+round
  // narrows to a single round's final results.
  function getLeaderboard(opts) {
    var o = (typeof opts === "number") ? { limit: opts } : (opts || {});
    return apiGet("getLeaderboard", {
      gameType: CONFIG.gameType, limit: o.limit || 100, code: o.code, round: o.round
    });
  }

  /* ---------------------------------------------------------------
     UI HELPERS — small reusable pieces every game needs, styling
     left to the page's own CSS via these class names.
  ----------------------------------------------------------------*/
  function maskHtml(game, kicker, sub) {
    var remaining = Math.max(0, Math.ceil(((game && game.countdownEndsAt) || 0 - Date.now()) / 1000));
    return (
      '<div class="mask" id="countMask">' +
        '<div class="mask-kicker">' + (kicker || "Starting in") + '</div>' +
        '<div class="mask-num mono" id="maskNum">' + remaining + '</div>' +
        '<div class="mask-sub">' + (sub || "") + '</div>' +
      '</div>'
    );
  }

  function updateMaskNum(game) {
    var el = document.getElementById("maskNum");
    if (el && game) {
      el.textContent = Math.max(0, Math.ceil((game.countdownEndsAt - Date.now()) / 1000));
    }
  }

  function scoreboardTableHtml(rows, columns) {
    // columns: [{key, label, numeric}]
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
      retryFailedWrite: retryFailedWrite,
      getCurrent: function () { return currentGame; }
    },
    players: {
      pushProgress: pushProgress,
      saveRun: saveRun,
      getPlayers: getPlayers
    },
    leaderboard: { get: getLeaderboard },
    ui: { maskHtml: maskHtml, updateMaskNum: updateMaskNum, scoreboardTableHtml: scoreboardTableHtml }
  };
})(window);
