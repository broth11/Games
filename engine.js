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

  var CONFIG = { appsScriptUrl: "", gameType: "", music: null };
  var COUNTDOWN_MS = 5000;
  var WAITING_ROUND = 0;
  var CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

  function configure(opts) {
    CONFIG.appsScriptUrl = opts.appsScriptUrl;
    CONFIG.gameType = opts.gameType;
    CONFIG.music = opts.music || null; // optional, host pages only: {idle, countdown, live, ended}
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
      if (res && res.ok) return confirmCodeReadable(code, 3);
      throw new Error((res && res.error) || "create_failed");
    });
  }

  // After a successful createGame write, confirm the code is actually
  // readable via getGame before handing it back to the caller. Apps
  // Script + Sheets writes aren't always instantly visible to the very
  // next separate request, so without this, the caller's first poll can
  // land during that gap and wrongly conclude the code doesn't exist.
  function confirmCodeReadable(code, attemptsLeft) {
    return apiGet("getGame", { code: code }).then(function (game) {
      if (game && game.exists) return code;
      if (attemptsLeft <= 1) return code;
      return new Promise(function (resolve) {
        setTimeout(function () { resolve(confirmCodeReadable(code, attemptsLeft - 1)); }, 400);
      });
    }).catch(function () { return code; });
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
  var notFoundStreak = 0;

  // Guards against a poll response that reflects the server's state from
  // BEFORE a manual startRound/endRound write has landed. Without this, a
  // slow-to-arrive poll can show the old, still-running round and clobber
  // the local state we already updated optimistically — which looks like
  // the round "restarting" on its own right after End Round Now was
  // clicked.
  function isStaleAgainstLocal(fetched, known) {
    if (!known || !fetched) return false;
    if (fetched.code !== known.code) return false;
    if (fetched.round < known.round) return true;
    if (fetched.round === known.round && known.gameEndsAt && fetched.gameEndsAt > known.gameEndsAt) return true;
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
    notFoundStreak = 0;
    var base = intervalMs || 2000;
    function tick() {
      var mySeq = ++pollSeq;
      apiGet("getGame", { code: code }).then(function (game) {
        if (mySeq !== pollSeq) return;
        var retired = !!(game && game.retired);
        var fetchedGame = (game && game.exists && !retired) ? game : null;
        if (isStaleAgainstLocal(fetchedGame, currentGame)) return;
        if (!fetchedGame && !retired) {
          notFoundStreak++;
          if (notFoundStreak < 2) return;
        } else {
          notFoundStreak = 0;
        }
        currentGame = fetchedGame;
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
  // forceOnTime skips the "did we hear in time" check entirely and always
  // gives an on-time countdown + full duration. Used for anyone who has
  // already joined at least one round this session (a restart, or the
  // normal next-round handoff) — they're actively connected and polling,
  // so there's no ambiguity about whether the round "really just
  // started" the way there is for a fresh registration mid-round. Without
  // this, a student could occasionally miss the 5s countdown window
  // purely from poll-timing/backend latency and get silently skipped
  // past the shared countdown moment everyone else in the room sees.
  function planRound(game, forceOnTime) {
    if (!game || !game.exists || !game.gameEndsAt) return null;
    var now = Date.now();
    if (now >= game.gameEndsAt) return null; // round's over

    if (forceOnTime || now < game.countdownEndsAt) {
      // Heard in time (or we're forcing it) — our own clean countdown,
      // then the full duration.
      var cd = now + COUNTDOWN_MS;
      return {
        round: game.round,
        countdownEnd: cd,
        playEnd: cd + game.durationSec * 1000,
        late: false,
        secondsAvailable: game.durationSec
      };
    }

    // Late joiner (first-ever round for this device, heard about it well
    // after it started) — no countdown, share the room's finish line.
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

  function pushWaitingPresence(fields) {
    return pushProgress(Object.assign({
      round: WAITING_ROUND,
      score: 0, streak: 0, bestStreak: 0,
      correct: 0, attempted: 0
    }, fields || {}));
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
     AUDIO — host-only background music, keyed to the round phase.

     FOR HOST PAGES ONLY. Nothing is constructed or fetched until the
     first playFor() call, so a student page that never calls it
     downloads zero bytes of audio even though this code ships in the
     shared engine. Do NOT wire this into a student index.html — 30
     phones looping the same track slightly out of sync is genuinely
     unpleasant in a room.

     Config is per game, in that game's Engine.configure(...):
       music: { idle, countdown, live, ended }
     Keys MUST match what derivePhase() returns. Any phase omitted is
     deliberate silence; no `music` key at all means a silent game.

     Phase changes cross-fade, so a round ending fades out rather than
     sounding like a crash.
  ----------------------------------------------------------------*/
  var FADE_MS = 450;
  var MUSIC_VOLUME = 0.35;   // low by default — the host talks over this
  var audioEls = {};         // phase -> HTMLAudioElement, built on demand
  var audioPhase = null;
  var audioMuted = (lsGet("audioMuted") === "1");
  var audioBlocked = false;

  function signalAudioChange() {
    if (global.dispatchEvent && global.CustomEvent) {
      global.dispatchEvent(new CustomEvent("engineaudiochange"));
    }
  }

  function getAudioEl(phase) {
    if (audioEls[phase]) return audioEls[phase];
    var src = CONFIG.music && CONFIG.music[phase];
    if (!src) return null;
    var a = new Audio(src);
    a.loop = true;
    a.preload = "auto";
    a.volume = 0;
    audioEls[phase] = a;
    return a;
  }

  function fadeTo(a, target, ms) {
    if (!a) return;
    if (a._fadeTimer) clearInterval(a._fadeTimer);
    var from = a.volume, start = Date.now();
    a._fadeTimer = setInterval(function () {
      var t = Math.min(1, (Date.now() - start) / ms);
      a.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t >= 1) {
        clearInterval(a._fadeTimer); a._fadeTimer = null;
        if (target === 0) { a.pause(); a.currentTime = 0; }
      }
    }, 30);
  }

  function startPhaseTrack(phase) {
    var el = getAudioEl(phase);
    if (!el) return;
    el.volume = 0;
    // Rejects if no user gesture has happened yet. On a host page the
    // teacher has usually clicked something first, but restored host tabs
    // can still hit autoplay policy before any gesture in this page load.
    var p = el.play();
    if (p && p.then) {
      p.then(function () {
        audioBlocked = false;
        fadeTo(el, MUSIC_VOLUME, FADE_MS);
      }).catch(function () {
        audioBlocked = true;
        signalAudioChange();
      });
    } else {
      audioBlocked = false;
      fadeTo(el, MUSIC_VOLUME, FADE_MS);
    }
  }

  // Safe to call on every tick — a repeat of the current phase is a no-op.
  function playFor(phase) {
    if (phase === audioPhase) return;
    var outgoing = audioPhase ? audioEls[audioPhase] : null;
    audioPhase = phase;
    if (outgoing) fadeTo(outgoing, 0, FADE_MS);
    if (audioMuted) return;
    startPhaseTrack(phase);
  }

  function stopAudio() {
    Object.keys(audioEls).forEach(function (p) { fadeTo(audioEls[p], 0, FADE_MS); });
    audioPhase = null;
  }

  // Persists across reloads — a machine muted last period stays muted
  // rather than surprising the room on refresh.
  function setMuted(v) {
    audioMuted = !!v;
    lsSet("audioMuted", audioMuted ? "1" : "0");
    if (audioMuted) {
      audioBlocked = false;
      Object.keys(audioEls).forEach(function (p) { fadeTo(audioEls[p], 0, FADE_MS); });
    } else if (audioPhase) startPhaseTrack(audioPhase);
  }

  function isMuted() { return audioMuted; }
  function needsGesture() { return !!(audioBlocked && !audioMuted && audioPhase && CONFIG.music && CONFIG.music[audioPhase]); }
  function unlock() {
    if (!audioPhase || audioMuted) return;
    audioBlocked = false;
    startPhaseTrack(audioPhase);
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
    WAITING_ROUND: WAITING_ROUND,
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
      pushWaitingPresence: pushWaitingPresence,
      saveRun: saveRun,
      getPlayers: getPlayers
    },
    leaderboard: { get: getLeaderboard },
    audio: { playFor: playFor, stop: stopAudio, setMuted: setMuted, isMuted: isMuted, needsGesture: needsGesture, unlock: unlock },
    ui: { maskHtml: maskHtml, setMaskNum: setMaskNum, scoreboardTableHtml: scoreboardTableHtml }
  };
})(window);
