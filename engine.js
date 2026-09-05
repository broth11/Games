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

  function startPolling(code, intervalMs, onUpdate) {
    stopPolling();
    function tick() {
      apiGet("getGame", { code: code }).then(function (game) {
        currentGame = game && game.exists ? game : null;
        onUpdate(currentGame);
      }).catch(function () { /* transient network hiccup — next tick retries */ });
    }
    tick();
    pollTimer = setInterval(tick, intervalMs || 1000);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  function startRound(code, minutes) {
    var durationSec = Math.round(minutes * 60);
    var now = Date.now();
    var countdownEndsAt = now + COUNTDOWN_MS;
    var gameEndsAt = countdownEndsAt + durationSec * 1000;
    var round = (currentGame && currentGame.round ? currentGame.round : 0) + 1;
    return apiPost("startRound", {
      code: code, round: round, durationSec: durationSec,
      countdownEndsAt: countdownEndsAt, gameEndsAt: gameEndsAt
    });
  }

  function endRound(code) {
    return apiPost("endRound", { code: code });
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

  function getLeaderboard(limit) {
    return apiGet("getLeaderboard", { gameType: CONFIG.gameType, limit: limit || 100 });
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
