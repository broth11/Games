/* Shared production transport, identity and round lifecycle. No dependencies. */
(function (global) {
  'use strict';
  const settings = global.GAME_CONFIG || {};
  const prefix = 'games:';
  const previousPrefix = 'games-b:live:';
  let config = {}, currentGame = null, pollToken = 0, pollTimer, connectedAt = 0;
  const emit = (name, detail) => global.dispatchEvent(new CustomEvent(name, {detail}));
  const parseStored = (name, fallback) => { try { const value=localStorage.getItem(name);return value===null?fallback:JSON.parse(value)??fallback; } catch (_) { return fallback; } };
  const read = (key, fallback = null) => {
    let value=parseStored(prefix+key,undefined);
    if(value===undefined)value=parseStored(previousPrefix+key,undefined);
    if(value===undefined&&key==='muted')value=localStorage.getItem('engine_audioMuted')==='1';
    return value===undefined?fallback:value;
  };
  const write = (key, value) => { try { if(value===null){localStorage.removeItem(prefix+key);localStorage.removeItem(previousPrefix+key);}else localStorage.setItem(prefix+key,JSON.stringify(value)); } catch (_) {} };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function configure(opts) {
    config = {...opts, appsScriptUrl: settings.appsScriptUrl || opts.appsScriptUrl};
  }
  async function request(action, args, post) {
    if (!config.appsScriptUrl) throw new Error('The classroom connection has not been configured.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const params = new URLSearchParams({action});
      Object.entries(args || {}).forEach(([k,v]) => { if(v !== undefined && v !== null) params.set(k,v); });
      const response = await fetch(config.appsScriptUrl + (post ? '' : '?' + params), post ? {
        method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({action,...args}), signal:controller.signal
      } : {signal:controller.signal});
      if (!response.ok) throw new Error('The classroom connection is temporarily unavailable.');
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      if (post && result.ok !== true) throw new Error('The server did not confirm the update.');
      return result;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('The connection is taking too long. Your entries are still here. Try again.');
      throw e;
    } finally { clearTimeout(timer); }
  }
  const get = (action,args={}) => request(action,args,false);
  const post = (action,args={}) => request(action,args,true);
  const identity = {
    studentId:'', displayName:'', period:'',
    isLoggedIn:() => !!identity.studentId,
    async lookup(id) {
      const result = await get('getStudent',{id:String(id).trim()});
      if (result.found) Object.assign(identity,{studentId:String(result.studentId),displayName:result.displayName || 'Student',period:result.period});
      return result;
    },
    logout() { identity.studentId=''; identity.displayName=''; identity.period=''; write('remembered',null); }
  };
  function generateCode() {
    const chars='ABCDEFGHJKMNPQRSTUVWXYZ23456789', bytes=new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return [...bytes].map(n => chars[n % chars.length]).join('');
  }
  async function createGame(retireCode) {
    for (let attempt=0; attempt<5; attempt++) {
      const code=generateCode();
      try { await post('createGame',{code,gameType:config.gameType,retireCode}); }
      catch(e) { if(e.message==='code_exists') continue; throw e; }
      currentGame=await get('getGame',{code});
      if(!currentGame.exists) throw new Error('The room is still being prepared. Try reconnecting with '+code+'.');
      return code;
    }
    throw new Error('Could not reserve a code. Please try again.');
  }
  function derivePhase(game) {
    if(!game || !game.exists || !game.gameEndsAt) return 'idle';
    if(Date.now()<game.countdownEndsAt) return 'countdown';
    if(Date.now()<game.gameEndsAt) return 'live';
    return 'ended';
  }
  const isFullRound = game => !!(game && game.round>0 && game.durationSec>0 && game.gameEndsAt >= game.countdownEndsAt + game.durationSec*1000 - 1000);
  function stopPolling() { ++pollToken; clearTimeout(pollTimer); }
  function startPolling(code, intervalMs, onUpdate) {
    stopPolling(); connectedAt=Date.now(); const token=pollToken; let failures=0;
    async function tick() {
      try {
        const game=await get('getGame',{code});
        if(token!==pollToken) return;
        failures=0;
        if(game.exists && !game.retired && game.gameType===config.gameType) {
          if(currentGame && currentGame.code===code && (game.round<currentGame.round || (game.round===currentGame.round && game.gameEndsAt>currentGame.gameEndsAt && currentGame.gameEndsAt))) return;
          currentGame=game; onUpdate(game,{});
        } else { currentGame=null; onUpdate(null,{retired:!!game.retired}); }
        emit('engineconnection',{ok:true});
      } catch(e) { failures++; if(token===pollToken) emit('engineconnection',{ok:false,message:e.message}); }
      finally { if(token===pollToken) pollTimer=setTimeout(tick,Math.min(8000,(intervalMs||2000)*(1+failures))+Math.random()*700); }
    }
    tick();
  }
  async function startRound(code,minutes) {
    const before=await get('getGame',{code});
    if(!before.exists || before.retired || before.gameType!==config.gameType) throw new Error('This room is no longer available.');
    if(['live','countdown'].includes(derivePhase(before))) throw new Error('A round is already running.');
    const durationSec=Math.round(Number(minutes)*60);
    if(!Number.isFinite(durationSec)||durationSec<15||durationSec>3600) throw new Error('Choose a duration between 15 seconds and 60 minutes.');
    const countdownEndsAt=Date.now()+5000;
    const payload={code,round:before.round+1,durationSec,countdownEndsAt,gameEndsAt:countdownEndsAt+durationSec*1000};
    try { await post('startRound',payload); }
    catch(e) {
      const check=await get('getGame',{code});
      if(check.round!==payload.round || check.countdownEndsAt!==payload.countdownEndsAt) throw e;
    }
    currentGame={...before,...payload}; return currentGame;
  }
  async function endRound(code) {
    try { await post('endRound',{code}); }
    catch(e) { const check=await get('getGame',{code}); if(derivePhase(check)!=='ended') throw e; }
    currentGame=await get('getGame',{code}); return currentGame;
  }
  function plan(game,forceOnTime) {
    const now=Date.now();
    if(!game || !game.exists || now>=game.gameEndsAt) return null;
    const nearStart=now<game.countdownEndsAt+8000 && (forceOnTime || connectedAt<game.countdownEndsAt);
    if(now<game.countdownEndsAt || nearStart) {
      return {round:game.round,countdownEnd:now+5000,playEnd:now+5000+game.durationSec*1000,late:false,secondsAvailable:game.durationSec};
    }
    return {round:game.round,countdownEnd:0,playEnd:game.gameEndsAt,late:true,secondsAvailable:Math.max(0,Math.ceil((game.gameEndsAt-now)/1000))};
  }
  function runCountdown(end,onTick,onDone) {
    let last;
    const tick=()=>{const n=Math.ceil((end-Date.now())/1000);if(n<=0){clearInterval(timer);onDone?.();}else if(n!==last){last=n;onTick?.(n);}};
    const timer=setInterval(tick,80); tick(); return {cancel:()=>clearInterval(timer)};
  }
  const progressQueues=new Map(), saves=new Map();
  const runKey=p=>p.code+':'+p.round+':'+p.studentId;
  function pushProgress(fields) {
    const key=runKey(fields), payload={gameType:config.gameType,...fields};
    const job=(progressQueues.get(key)||Promise.resolve()).catch(()=>{}).then(()=>post('updatePlayer',payload));
    progressQueues.set(key,job);
    return job.catch(e=>{emit('engineconnection',{ok:false,message:e.message});return null;});
  }
  async function commitRun(payload) {
    const key=runKey(payload);
    emit('enginesave',{state:'saving',key}); write('pending:'+key,payload);
    try {
      await (progressQueues.get(key)||Promise.resolve()).catch(()=>{});
      // Read before write also makes an explicit retry safe after a lost response.
      const rows=await get('getLeaderboard',{gameType:config.gameType,code:payload.code,round:payload.round,limit:1000});
      if(!rows.some(r=>String(r.studentId)===String(payload.studentId))) await post('saveRun',payload);
      write('pending:'+key,null); emit('enginesave',{state:'saved',key}); return true;
    } catch(e) {
      emit('enginesave',{state:'pending',key,message:e.message}); return false;
    }
  }
  function saveRun(fields) {
    const payload={gameType:config.gameType,ts:Date.now(),...fields},key=runKey(payload);
    if(saves.has(key)) return saves.get(key);
    const job=commitRun(payload); saves.set(key,job); return job;
  }
  function retrySave(key) {const payload=read('pending:'+key);return payload ? commitRun(payload) : Promise.resolve(true);}
  function retryPending() {
    const keys=new Set();
    for(let i=0;i<localStorage.length;i++){
      const stored=localStorage.key(i);
      for(const base of [prefix,previousPrefix])if(stored?.startsWith(base+'pending:'))keys.add(stored.slice((base+'pending:').length));
    }
    return Promise.all([...keys].map(key=>{
      const payload=read('pending:'+key);
      return payload&&payload.gameType===config.gameType?commitRun(payload):Promise.resolve(true);
    }));
  }
  function maskHtml(end,kicker,sub) {return '<div class="mask" id="countMask"><div class="mask-kicker">'+esc(kicker)+'</div><div class="mask-num" id="maskNum">'+Math.max(0,Math.ceil((end-Date.now())/1000))+'</div><div class="mask-sub">'+esc(sub)+'</div></div>';}
  function scoreboardTableHtml(rows,columns) {return '<table class="lb"><thead><tr><th>Rank</th>'+columns.map(c=>'<th>'+esc(c.label)+'</th>').join('')+'</tr></thead><tbody>'+rows.map((r,i)=>'<tr><td>'+(i+1)+'</td>'+columns.map(c=>'<td>'+esc(r[c.key])+'</td>').join('')+'</tr>').join('')+'</tbody></table>';}
  global.Engine={
    configure,generateCode,COUNTDOWN_MS:5000,WAITING_ROUND:0,
    config:()=>config,storage:{read,write},esc,api:{get,post},identity,
    session:{derivePhase,isFullRound,createGame,startPolling,stopPolling,startRound,endRound,getCurrent:()=>currentGame,checkCode:async code=>{const g=await get('getGame',{code});return !!(g.exists&&!g.retired&&g.gameType===config.gameType);}},
    round:{plan,runCountdown},
    players:{pushProgress,pushWaitingPresence:fields=>pushProgress({round:0,score:0,streak:0,bestStreak:0,correct:0,attempted:0,...fields}),saveRun,retrySave,retryPending,getPlayers:(code,round)=>get('getPlayers',{code,round})},
    leaderboard:{get:opts=>get('getLeaderboard',{gameType:config.gameType,limit:1000,...(typeof opts==='number'?{limit:opts}:opts)})},
    ui:{maskHtml,setMaskNum:n=>{const el=document.getElementById('maskNum');if(el)el.textContent=n;},scoreboardTableHtml,bindEnterFlow:()=>{}}
  };
})(window);
