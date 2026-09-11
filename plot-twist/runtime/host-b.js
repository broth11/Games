(function(){
  'use strict';
  const E=Engine,B=window.GAME_B_BRAND,esc=E.esc,q=new URLSearchParams(location.search);
  E.configure({gameType:B.gameType,music:{idle:'audio-b/'+B.slug+'-idle.mp3',live:'audio-b/'+B.slug+'-live.mp3'}});
  const shell=document.getElementById('hostMain'),status=document.getElementById('hostStatus');
  let code='',game=null,roster=[],players=[],runs=[],expected=new Set(),screen='',duration=10,busy=false,scoreBusy=false,writePending=false;
  let revealKey='',autoRevealAllowed=false,announced=false,scoreError='',settlingSince=0,scoreToken=0,lastRowsAt=0;
  const modeSuffix=E.preview?'':'&mode=live';
  const key='host:'+B.slug;
  const mmss=n=>Math.floor(n/60)+':'+String(Math.max(0,n%60)).padStart(2,'0');
  const phase=()=>E.session.derivePhase(game);
  const sorted=rows=>[...rows].sort((a,b)=>b.score-a.score||String(a.displayName).localeCompare(String(b.displayName)));
  function unique(rows){const map=new Map();rows.forEach(r=>{const id=String(r.studentId),old=map.get(id);if(!old||Number(r.ts||0)>Number(old.ts||0))map.set(id,r);});return sorted([...map.values()]);}
  function notify(text){status.textContent=text||'';}
  function setScreen(next,html){if(screen===next)return;screen=next;shell.innerHTML=html;}
  function codePanel(){return `<span class="b-eyebrow">${E.preview?'Preview room':'Room code'}</span><strong class="b-room-display">${esc(code)}</strong><p>Open ${esc(B.title)} and enter this code.</p><div class="b-room-tools"><button class="b-secondary" data-action="copy">Copy student link</button><a class="b-secondary" target="_blank" rel="noopener" href="index.html?code=${esc(code)}${modeSuffix}">Open student screen ↗</a></div>`;}
  function scoreTable(rows){return `<table class="b-score-table"><thead><tr><th>Rank</th><th>Name</th><th>Points</th></tr></thead><tbody>${sorted(rows).map((r,i)=>`<tr><td>${i>0&&r.score===sorted(rows)[i-1].score?'=':i+1}</td><td>${esc(r.displayName)}</td><td>${Number(r.score||0).toLocaleString()}</td></tr>`).join('')}</tbody></table>`;}
  function rosterHtml(){return roster.length?`<div class="b-roster">${roster.map(r=>`<div class="b-person"><span class="b-initial">${esc(String(r.displayName||'?').slice(0,1))}</span><div><b>${esc(r.displayName)}</b><small>${esc(r.period)}</small></div></div>`).join('')}</div>`:'<div class="b-empty"><strong>The room is open.</strong>Students appear here after their code and ID are confirmed.</div>';}
  function draw(){
    if(!code){
      setScreen('setup',`<section class="b-setup b-panel"><img src="logo.png" alt="${esc(B.title)}"><span class="b-eyebrow">${E.preview?'Version B · Private preview':'Teacher dashboard'}</span><h2>Open the room.</h2><p>Share one code. See who’s ready. Start when your class is settled.</p><button class="b-primary" data-action="create">Create a room</button><details><summary>Reconnect to an existing room</summary><label for="hostCode">Four-character code</label><input class="b-host-code-input" id="hostCode" type="text" maxlength="4" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="ABCD"><button class="b-secondary" data-action="rejoin">Reconnect</button></details>${E.preview?'<p class="b-host-note">Preview data stays in this browser. Open a student tab and use ID 1001, 1002, or 1003.</p>':''}</section>`);return;
    }
    if(!game){setScreen('connecting','<div class="b-tally b-results"><span class="b-eyebrow">Connecting</span><h1>Opening your room…</h1><div class="b-loading-track"></div></div>');return;}
    const p=phase();
    if(p==='idle'){
      setScreen('lobby',`<div class="b-host-grid"><section class="b-panel">${codePanel()}<label id="durationLabel">Round length</label><div class="b-duration" aria-labelledby="durationLabel">${(E.preview?[0.5,3,5,8,10]:[3,5,8,10]).map(n=>`<button data-minutes="${n}" aria-pressed="${n===duration}">${n===0.5?'30 sec':n+' min'}</button>`).join('')}</div><button class="b-primary" data-action="start">Start round</button><p class="b-host-note">Five-second countdown · individual progress · shared results</p></section><section class="b-panel"><span class="b-eyebrow">Waiting room</span><h2>Ready at their desks <span class="b-count" id="rosterCount"></span></h2><div id="roster"></div><p class="b-host-note">The roster refreshes automatically. Student IDs stay off the screen.</p></section></div>`);
      document.getElementById('rosterCount').textContent=roster.length;
      const el=document.getElementById('roster'),html=rosterHtml();if(el.innerHTML!==html)el.innerHTML=html;
      E.audio.playFor('idle');
    } else if(p==='live'||p==='countdown'){
      autoRevealAllowed=true;
      const type=p==='countdown'?'Countdown':'Round '+game.round;
      setScreen('playing',`<div class="b-host-grid"><section class="b-panel"><span class="b-eyebrow" id="clockPhase"></span><div class="b-live-clock" id="hostClock"></div><div class="b-clock-track"><span id="clockProgress"></span></div><div class="b-room-chip">ROOM <strong>${esc(code)}</strong></div><p class="b-host-note">${E.preview?'Preview round. ':'Students work at their own pace. '}The podium follows once the final results arrive.</p><div class="b-actions"><button class="b-danger" data-action="stop">Stop round early</button></div></section><section class="b-panel"><span class="b-eyebrow">Live standings</span><h2>The round is on.</h2><div id="liveScores"></div><p class="b-host-note">Live scores refresh every five seconds. Final places use saved results.</p></section></div>`);
      document.getElementById('clockPhase').textContent=type;
      const secs=Math.max(0,Math.ceil(((p==='countdown'?game.countdownEndsAt:game.gameEndsAt)-Date.now())/1000));
      document.getElementById('hostClock').textContent=p==='countdown'?String(secs):mmss(secs);
      document.getElementById('clockProgress').style.width=(p==='countdown'?100:Math.max(0,secs/game.durationSec*100))+'%';
      const el=document.getElementById('liveScores'),html=players.length?scoreTable(players):'<div class="b-empty"><strong>Round in progress</strong>Scores arrive as students begin.</div>';if(el.innerHTML!==html)el.innerHTML=html;
      E.audio.playFor(p);
    } else {
      E.audio.playFor('ended');
      if(screen==='podium')return;
      if(!E.session.isFullRound(game)){
        setScreen('stopped',`<section class="b-results b-panel"><span class="b-eyebrow">Round ${game.round}</span><h1>Round stopped.</h1><p class="b-subtitle">Students’ submitted results are retained. This round won’t trigger a victory celebration.</p><div id="stoppedScores"></div><div class="b-actions"><button class="b-primary" data-action="next">Set up next round</button><button class="b-secondary" data-action="new">New room</button></div></section>`);
        const el=document.getElementById('stoppedScores'),html=runs.length?scoreTable(runs):'<p>Waiting for any final submissions…</p>';if(el.innerHTML!==html)el.innerHTML=html;return;
      }
      if(!settlingSince)settlingSince=Date.now();
      const waited=Date.now()-game.gameEndsAt;
      const saved=new Set(runs.map(r=>String(r.studentId)));
      const missing=[...expected].filter(id=>!saved.has(id));
      const complete=runs.length>0 && missing.length===0 && waited>=14000 && !scoreError && lastRowsAt>game.gameEndsAt+12000;
      if(complete && autoRevealAllowed && runs.some(r=>r.attempted>0)){reveal(false);return;}
      setScreen('tally',`<section class="b-results b-tally"><span class="b-eyebrow">Round ${game.round} complete</span><h1>Every result counts.</h1><p class="b-subtitle">Collecting final scores before the podium.</p><div class="b-tally-number" id="savedCount"></div><div class="b-loading-track"></div><p id="tallyNote" class="b-subtitle"></p><div class="b-actions" id="tallyActions"></div></section>`);
      document.getElementById('savedCount').textContent=runs.length+' / '+Math.max(expected.size,runs.length);
      document.getElementById('tallyNote').textContent=scoreError?'Reconnecting to confirm results…':complete&&!runs.some(r=>r.attempted>0)?'No answers were submitted in this round.':waited<14000?'Giving every device time to finish and save.':missing.length?missing.length+' student result'+(missing.length===1?' is':'s are')+' still on the way.':'Results received.';
      const actions=document.getElementById('tallyActions');
      const html=complete&&runs.some(r=>r.attempted>0)?'<button class="b-primary" data-action="reveal">Reveal podium</button>':waited>30000?`${runs.length?'<button class="b-secondary" data-action="partial">View available results</button>':''}<button class="b-secondary" data-action="next">Set up next round</button>`:'';
      if(actions.innerHTML!==html)actions.innerHTML=html;
    }
  }
  function reveal(partial){
    const rows=unique(runs),roundKey=code+':'+game.round;
    if(!rows.length)return;
    const top=rows.slice(0,3),ranks=rows.map((r,i)=>i&&r.score===rows[i-1].score?null:i+1);
    for(let i=1;i<ranks.length;i++)if(ranks[i]===null)ranks[i]=ranks[i-1];
    const places=top.length===3?[1,0,2]:top.length===2?[1,0]:[0];
    const podium=places.map(i=>`<div class="b-podium-place ${ranks[i]===1?'winner':''}" style="--delay:${i===2?'0s':i===1?'.45s':'.95s'};--height:${i===0?190:i===1?145:110}px"><div class="b-medal">${ranks[i]}</div><strong class="b-podium-name">${esc(top[i].displayName)}</strong><div class="b-podium-step"><span class="b-podium-score">${Number(top[i].score).toLocaleString()}</span><small>POINTS · ${Number(top[i].accuracy||0)}% ACCURACY</small></div></div>`).join('');
    const allAttempted=rows.reduce((n,r)=>n+Number(r.attempted||0),0);
    const correct=rows.reduce((n,r)=>n+Number(r.correct||0),0);
    setScreen('podium',`<section class="b-results"><span class="b-eyebrow">${esc(B.label)} · Round ${game.round}</span><div class="b-celebration-rule"></div><h1>${partial?'Results received.':'A round worth celebrating.'}</h1><p class="b-subtitle">${partial?'Some results are still missing. These places are provisional.':'Final scores confirmed. Well played, everyone.'}</p>${partial?scoreTable(rows):'<div class="b-podium">'+podium+'</div>'}<div class="b-round-summary"><span><b>${rows.length}</b> results</span><span><b>${allAttempted}</b> answers</span><span><b>${allAttempted?Math.round(correct/allAttempted*100):0}%</b> class accuracy</span></div>${!partial&&rows.length>3?scoreTable(rows):''}<div class="b-actions"><button class="b-primary" data-action="next">Set up next round</button><button class="b-secondary" data-action="new">New room</button></div></section>`);
    if(!partial&&revealKey!==roundKey){revealKey=roundKey;const already=E.storage.read('celebrated:'+roundKey,false);E.storage.write('celebrated:'+roundKey,true);if(!already)E.audio.fanfare(roundKey);}
  }
  async function collect(){
    if(scoreBusy||!code||!game)return;
    scoreBusy=true;const token=scoreToken,round=game.round,room=code;
    try{
      const p=phase();
      if(p==='idle'){
        const rows=await E.players.getPlayers(room,0);if(token!==scoreToken)return;roster=unique(rows);
      }else{
        const responses=await Promise.all([E.players.getPlayers(room,round),p==='ended'?E.leaderboard.get({code:room,round}):Promise.resolve(null)]);
        if(token!==scoreToken||round!==game?.round)return;
        players=unique(responses[0]);players.forEach(r=>expected.add(String(r.studentId)));
        if(responses[1])runs=unique(responses[1]);
      }
      scoreError='';lastRowsAt=Date.now();draw();
    }catch(e){scoreError=e.message;notify('Reconnecting… Your room is still open.');}
    finally{scoreBusy=false;}
  }
  function connect(room){
    code=room;E.storage.write(key,code);screen='';scoreToken++;scoreBusy=false;
    E.session.startPolling(code,2500,(value)=>{
      if(writePending)return;
      if(!value){E.session.stopPolling();code='';game=null;E.storage.write(key,'');screen='';notify('This room has closed. Create a new one.');draw();return;}
      if(game&&value.round!==game.round){players=[];runs=[];expected=new Set(roster.map(r=>String(r.studentId)));scoreToken++;screen='';settlingSince=0;}
      game=value;draw();if(!lastRowsAt)collect();
    });draw();
  }
  async function perform(fn){if(busy)return;busy=true;notify('');document.querySelectorAll('[data-action]').forEach(b=>b.disabled=true);try{await E.audio.unlock();await fn();}catch(e){notify(e.message);}finally{busy=false;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=false);}}
  async function setupNext(){
    // Keep the completed server round intact while the host chooses the next duration.
    screen='';E.session.stopPolling();E.audio.playFor('idle');
    shell.innerHTML=`<section class="b-setup b-panel"><span class="b-eyebrow">Room ${esc(code)}</span><h2>Ready for another round?</h2><p>Students can stay in the same room.</p><label>Round length</label><div class="b-duration">${(E.preview?[0.5,3,5,8,10]:[3,5,8,10]).map(n=>`<button data-minutes="${n}" aria-pressed="${n===duration}">${n===.5?'30 sec':n+' min'}</button>`).join('')}</div><button class="b-primary" data-action="start">Start next round</button><div class="b-actions"><button class="b-secondary" data-action="new">New room instead</button></div></section>`;screen='next';
  }
  async function act(action){
    if(action==='create'||action==='new'){
      const old=code;const fresh=await E.session.createGame(action==='new'?old:undefined);
      game=null;players=[];runs=[];roster=[];expected.clear();lastRowsAt=0;autoRevealAllowed=false;connect(fresh);return;
    }
    if(action==='rejoin'){
      const value=document.getElementById('hostCode').value.toUpperCase().replace(/[^A-Z0-9]/g,'');
      if(value.length!==4)throw new Error('Enter the four-character room code.');
      if(!await E.session.checkCode(value))throw new Error('That room is not active for this game.');
      game=null;connect(value);return;
    }
    if(action==='start'){
      writePending=true;notify('Confirming the start…');
      try{const value=await E.session.startRound(code,duration);game=value;expected=new Set(roster.map(r=>String(r.studentId)));players=[];runs=[];settlingSince=0;scoreToken++;autoRevealAllowed=true;screen='';notify('');connect(code);draw();}
      finally{writePending=false;}
      return;
    }
    if(action==='stop'){document.getElementById('stopDialog').showModal();return;}
    if(action==='confirm-stop'){
      document.getElementById('stopDialog').close();writePending=true;
      try{game=await E.session.endRound(code);screen='';autoRevealAllowed=false;draw();collect();}finally{writePending=false;}return;
    }
    if(action==='cancel-stop'){document.getElementById('stopDialog').close();return;}
    if(action==='copy'){
      const url=new URL('index.html',location.href);url.searchParams.set('code',code);if(!E.preview)url.searchParams.set('mode','live');
      try{await navigator.clipboard.writeText(url.href);notify('Student link copied.');}catch(_){notify('Student link: '+url.href);}return;
    }
    if(action==='next'){await setupNext();return;}
    if(action==='reveal'){reveal(false);return;}
    if(action==='partial'){reveal(true);return;}
  }
  document.addEventListener('click',event=>{
    const minutes=event.target.closest('[data-minutes]');
    if(minutes){duration=Number(minutes.dataset.minutes);document.querySelectorAll('[data-minutes]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.minutes)===duration));return;}
    const button=event.target.closest('[data-action]');if(button)perform(()=>act(button.dataset.action));
  });
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='hostCode')perform(()=>act('rejoin'));});
  document.addEventListener('input',event=>{if(event.target.id==='hostCode')event.target.value=event.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);});
  const sound=document.getElementById('soundButton'),volume=document.getElementById('soundVolume');
  function soundLabel(){sound.textContent=E.audio.needsGesture()?'Enable sound':E.audio.isMuted()?'Sound off':'Sound on';sound.setAttribute('aria-pressed',!E.audio.needsGesture()&&!E.audio.isMuted());}
  sound.onclick=async()=>{const wasBlocked=E.audio.needsGesture();await E.audio.unlock();if(wasBlocked)E.audio.setMuted(false);else E.audio.setMuted(!E.audio.isMuted());soundLabel();};
  volume.value=E.audio.volume();volume.oninput=()=>E.audio.setVolume(volume.value);
  window.addEventListener('engineaudiochange',soundLabel);soundLabel();
  window.addEventListener('engineconnection',({detail})=>{if(!detail.ok)notify('Reconnecting… Your room stays open.');else if(!busy)notify('');});
  setInterval(()=>{if(screen!=='next')draw();},250);
  setInterval(()=>{if(screen!=='next'&&screen!=='podium')collect();},E.preview?1800:5000);
  const saved=q.get('code')||E.storage.read(key,'');
  if(saved){game=null;connect(saved);}else draw();
})();
