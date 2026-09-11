(function(){
  'use strict';
  const E=Engine,esc=E.esc,q=new URLSearchParams(location.search);
  let currentMount=null,saveKey='',retryAt=0,saveState='';
  function brand(){return window.GAME_BRAND;}
  function mount(root,onJoined,message=''){
    E.players.retryPending();
    if(currentMount===root&&root.querySelector('#bJoinForm'))return;
    currentMount=root;document.body.classList.add('b-joining');
    const b=brand(),remembered=E.storage.read('remembered','');
    root.innerHTML=`<div class="b-entry"><a class="b-back" href="../index.html">← All games</a><div class="b-entry-grid"><section class="b-intro"><span class="b-eyebrow">${esc(b.course)} · CLASSROOM</span><img class="b-entry-logo" src="logo.png" alt="${esc(b.title)}"><h1>${esc(b.invitation)}</h1><p>${esc(b.description)}</p><ol class="b-instructions">${b.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><div class="b-edition">${esc(b.label)}<span>01 / Join the room</span></div></section><section class="b-join-panel"><span class="b-eyebrow">Student entry</span><h2>Take your place.</h2><p class="b-muted">Use the code on your teacher’s screen.</p><form id="bJoinForm" novalidate><label for="bCode">Game code <span>4 characters</span></label><input id="bCode" name="game-code" class="b-code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="next" aria-describedby="bCodeHelp bJoinError" placeholder="ABCD" value="${esc((q.get('code')||'').slice(0,4).toUpperCase())}"><p id="bCodeHelp" class="b-field-help">Type or paste the full code.</p><label for="bId">Student ID</label><input id="bId" name="student-id" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="go" aria-describedby="bJoinError" placeholder="Your school ID" value="${esc(remembered)}"><label class="b-checkbox"><input type="checkbox" id="bRemember" ${remembered?'checked':''}> Remember my ID on this device</label><div id="bJoinError" class="b-form-status" role="status" aria-live="polite">${esc(message)}</div><button class="b-primary" id="bJoinButton" type="submit">Join room <span aria-hidden="true">→</span></button></form><div class="b-practice-entry"><span><b>Practising independently?</b><small>No code, ID, timer, or submitted score.</small></span><a class="b-secondary" href="?practice=1">Untimed Practice →</a></div></section></div></div>`;
    const form=root.querySelector('form'),code=root.querySelector('#bCode'),id=root.querySelector('#bId'),error=root.querySelector('#bJoinError'),button=root.querySelector('#bJoinButton');
    let busy=false;
    code.addEventListener('input',()=>{
      const start=code.selectionStart,old=code.value;
      const left=old.slice(0,start).toUpperCase().replace(/[^A-Z0-9]/g,'').length;
      code.value=old.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);
      code.setSelectionRange(Math.min(left,4),Math.min(left,4));
      code.removeAttribute('aria-invalid');error.textContent='';
      // Deliberately keep focus here: no surprise jumps when correcting a character.
    });
    id.addEventListener('input',()=>{id.removeAttribute('aria-invalid');error.textContent='';});
    code.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(code.value.length===4)id.focus();else{error.textContent='Enter all four characters of the game code.';code.setAttribute('aria-invalid','true');}}});
    function fail(field,text){error.textContent=text;field?.setAttribute('aria-invalid','true');field?.focus();}
    async function join(){
      if(busy)return;
      if(!/^[A-Z0-9]{4}$/.test(code.value))return fail(code,'Enter all four characters of the game code.');
      if(!id.value.trim())return fail(id,'Enter your student ID.');
      busy=true;button.disabled=true;code.readOnly=true;id.readOnly=true;button.textContent='Checking your place…';error.textContent='Connecting to the room…';form.setAttribute('aria-busy','true');
      try {
        const game=await E.api.get('getGame',{code:code.value});
        if(!game.exists||game.retired){fail(code,'That code is not active. Check the teacher’s screen.');return;}
        if(game.gameType!==E.config().gameType){fail(code,'This code belongs to a different game. Open the game shown by your teacher.');return;}
        const student=await E.identity.lookup(id.value.trim());
        if(!student.found){fail(id,'That ID is not on the roster. Check the number and try again.');return;}
        error.textContent='Joining as '+student.displayName+'…';
        const presence=await E.players.pushWaitingPresence({code:code.value,studentId:E.identity.studentId,displayName:E.identity.displayName,period:E.identity.period});
        if(!presence)throw new Error('Your ID was found, but the room could not confirm your place. Please try again.');
        E.storage.write('remembered',root.querySelector('#bRemember').checked?id.value.trim():'');
        document.body.classList.remove('b-joining');currentMount=null;onJoined(code.value);return true;
      }catch(e){error.textContent=e.message.includes('JSON')?'The classroom connection is unavailable. Your entries are still here.':e.message;}
      finally{busy=false;button.disabled=false;code.readOnly=false;id.readOnly=false;button.innerHTML='Join room <span aria-hidden="true">→</span>';form.removeAttribute('aria-busy');}
    }
    form.addEventListener('submit',e=>{e.preventDefault();join();});
  }
  function lobby(code){
    const b=brand();
    return `<section class="b-lobby"><a class="b-back" href="../index.html">← All games</a><img src="logo.png" alt="${esc(b.title)}"><span class="b-eyebrow">${esc(E.identity.displayName)} · ${esc(E.identity.period)}</span><h1>You’re in.</h1><p>Keep this screen open. Your teacher will start the round.</p><div class="b-room-chip">ROOM <strong>${esc(code)}</strong></div><details><summary>How to play</summary><ol>${b.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p>${esc(b.scoring)}</p></details><button class="b-secondary" id="switchCodeBtn">Change room or student</button></section>`;
  }
  function statusBar(){let el=document.getElementById('bSaveStatus');if(!el){el=document.createElement('div');el.id='bSaveStatus';el.className='b-save-status';el.setAttribute('role','status');document.body.append(el);}return el;}
  window.addEventListener('enginesave',event=>{
    const d=event.detail,el=statusBar();saveKey=d.key;saveState=d.state;
    if(d.state==='saving')el.textContent='Saving your result…';
    if(d.state==='saved')el.innerHTML='✓ Result saved. <span>Look up for the class podium.</span>';
    if(d.state==='pending'){
      retryAt=Date.now()+20000;
      el.innerHTML='Your result is kept on this device. Checking the connection…';
      setTimeout(()=>{if(saveKey!==d.key||saveState!=='pending')return;el.innerHTML='Your result is kept on this device. <button type="button">Retry saving</button>';el.querySelector('button').onclick=()=>{if(Date.now()>=retryAt)E.players.retrySave(saveKey);};},20000);
    }
  });
  let connectionBar;
  window.addEventListener('engineconnection',({detail})=>{
    if(detail.ok){connectionBar?.remove();connectionBar=null;return;}
    if(!connectionBar){connectionBar=document.createElement('div');connectionBar.className='b-connection';connectionBar.setAttribute('role','status');document.body.append(connectionBar);}
    connectionBar.textContent='Reconnecting… Keep playing; your clock runs on this device.';
  });
  E.join={mount,lobby};
})();
