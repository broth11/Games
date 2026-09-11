(function(){
'use strict';
const E=Engine,app=document.getElementById('app'),esc=E.esc,practice=new URLSearchParams(location.search).has('practice');
E.configure({gameType:GAME_B_BRAND.gameType});
let code='',round=-1,end=0,screen='join',deck=[],idx=0,rung=0,picked=null,score=0,correct=0,attempted=0,streak=0,bestStreak=0,misses={},cancel=null,flush=null,late=false;
function random(seed){let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function buildDeck(seed,lesson='all'){
 const r=random(seed),lessons=[...new Set(PLOT_CASES.map(c=>c.lesson))].filter(l=>lesson==='all'||l===lesson),groups=lessons.map(l=>shuffle(PLOT_CASES.filter(c=>c.lesson===l),r)),out=[];
 for(let k=0;k<4;k++)for(const group of groups)out.push(group[k]);
 return out.map(c=>({...c,questions:c.questions.map(q=>({...q,options:shuffle(q.choices.map((text,i)=>({text,correct:i===q.answer})),r)}))}));
}
function dots(values,unit,label='',extent=null){
 const lo=Math.min(0,...values),hi=extent??Math.max(...values),span=hi-lo||1,count={},maxStack=Math.max(...values.map(v=>values.filter(x=>x===v).length));
 const h=100+maxStack*19,x=v=>45+(v-lo)/span*470;
 return `<svg viewBox="0 0 560 ${h}" role="img" aria-label="${esc(label+unit+': '+values.join(', '))}"><text x="20" y="20">${esc(label)}</text><line x1="45" y1="${h-55}" x2="515" y2="${h-55}" stroke="currentColor"/>${[...new Set(values)].map(v=>`<text x="${x(v)}" y="${h-32}" text-anchor="middle">${v}</text>`).join('')}${values.map(v=>`<circle cx="${x(v)}" cy="${h-66-(count[v]=(count[v]||0)+1)*19}" r="6" fill="#c32f30"/>`).join('')}<text x="280" y="${h-6}" text-anchor="middle">${esc(unit)}</text></svg>`;
}
function box(v,label='',extent=60){const x=n=>40+n/extent*470;return `<svg viewBox="0 0 560 140" role="img" aria-label="${esc(label+' '+v.unit+'; whiskers '+v.min+' to '+v.max+', Q1 '+v.q1+', median '+v.median+', Q3 '+v.q3+', outliers '+(v.outliers||[]).join(', '))}"><text x="15" y="20">${esc(label)}</text><line x1="${x(v.min)}" x2="${x(v.max)}" y1="60" y2="60" stroke="currentColor"/><rect x="${x(v.q1)}" y="38" width="${x(v.q3)-x(v.q1)}" height="44" fill="#edd8b4" stroke="currentColor"/>${[v.min,v.median,v.max].map(n=>`<line x1="${x(n)}" x2="${x(n)}" y1="38" y2="82" stroke="currentColor" stroke-width="3"/>`).join('')}${(v.outliers||[]).map(n=>`<circle cx="${x(n)}" cy="60" r="5" fill="#c32f30"/>`).join('')}${[v.min,v.q1,v.median,v.q3,v.max,...v.outliers||[]].map(n=>`<text x="${x(n)}" y="105" text-anchor="middle">${n}</text>`).join('')}<text x="280" y="132" text-anchor="middle">${esc(v.unit)}</text></svg>`;}
function visual(v){
 if(v.type==='image')return `<img class="statistical-image" src="${esc(v.src)}" alt="${esc(v.alt)}">`;
 if(v.type==='tiles')return `<div class="tiles">${v.items.map(t=>`<div>${esc(t)}</div>`).join('')}</div>`;
 if(v.type==='table')return `<div class="table-scroll"><table><thead><tr>${v.headers.map(t=>`<th scope="col">${esc(t)}</th>`).join('')}</tr></thead><tbody>${v.rows.map(row=>`<tr>${row.map(t=>`<td>${esc(t)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 if(v.type==='dots')return dots(v.values,v.unit);
 if(v.type==='twodots')return dots(v.a,v.unit,'A',Math.max(...v.a,...v.b))+dots(v.b,v.unit,'B',Math.max(...v.a,...v.b));
 if(v.type==='box')return box(v);
 if(v.type==='twobox')return ['a','b'].map(k=>{const [min,q1,median,q3,max]=v[k];return box({min,q1,median,q3,max,unit:v.unit},k.toUpperCase());}).join('');
 if(v.type==='hist'){const max=Math.max(...v.counts),step=440/v.counts.length;return `<svg viewBox="0 0 560 280" role="img" aria-label="${esc(v.unit+'; frequencies: '+v.labels.map((l,i)=>l+': '+v.counts[i]).join('; '))}"><text x="12" y="20">Frequency</text>${[0,3,6,9].map(n=>`<text x="48" y="${223-n/max*180}" text-anchor="end">${n}</text><line x1="55" x2="495" y1="${220-n/max*180}" y2="${220-n/max*180}" stroke="#ccc"/>`).join('')}${v.counts.map((n,i)=>`<rect x="${55+i*step}" y="${220-n/max*180}" width="${step}" height="${n/max*180}" fill="#c32f30" stroke="#181714"/><text x="${55+(i+.5)*step}" y="${210-n/max*180}" text-anchor="middle">${n}</text><text x="${55+(i+.5)*step}" y="245" text-anchor="middle">${esc(v.labels[i])}</text>`).join('')}<text x="280" y="274" text-anchor="middle">${esc(v.unit)}</text></svg>`;}
 return '';
}
function fields(){return {code,round,studentId:E.identity.studentId,displayName:E.identity.displayName,period:E.identity.period,score,correct,attempted,streak,bestStreak};}
function progress(force=false){if(practice)return;if(force){clearTimeout(flush);flush=null;E.players.pushProgress(fields());}else if(!flush)flush=setTimeout(()=>{flush=null;E.players.pushProgress(fields());},5000);}
function reset(){idx=rung=score=correct=attempted=streak=bestStreak=0;picked=null;misses={};document.getElementById('bSaveStatus')?.remove();}
function finish(){if(screen==='results')return;cancel?.cancel();cancel=null;screen='results';if(!practice){progress(true);E.players.saveRun({...fields(),accuracy:attempted?Math.round(correct/attempted*100):0});}render();}
function render(){
 if(screen==='join'){E.join.mount(app,join);return;}
 if(screen==='lobby'){app.innerHTML=E.join.lobby(code);document.getElementById('switchCodeBtn').onclick=()=>{E.session.stopPolling();code='';round=-1;screen='join';render();};return;}
 if(screen==='countdown'){app.innerHTML=E.ui.maskHtml(end,'Get ready','Three decisions. One visual.');return;}
 if(screen==='practice'){app.innerHTML=`<section class="practice-panel"><span class="eyebrow">Untimed Practice · no ID required · no scores sent</span><h1>Pick your plot.</h1><p>Complete all 44 ladders, or focus on one lesson. Take as long as you need.</p><label for="lesson">Lesson</label><select id="lesson"><option value="all">All Unit 1A + 1B · 132 decisions</option>${[...new Set(PLOT_CASES.map(c=>c.lesson))].map(l=>`<option>${l}</option>`).join('')}</select><button id="practiceStart" class="b-primary">Start climbing →</button><a href="index.html">Back to classroom entry</a></section>`;document.getElementById('practiceStart').onclick=()=>{deck=buildDeck('practice',document.getElementById('lesson').value);reset();screen='play';render();};return;}
 if(screen==='results'){app.innerHTML=`<section class="results-panel"><span class="eyebrow">${practice?'Practice complete':'Round complete'}</span><h1>That’s the twist.</h1><div class="big-score">${score}<small> points</small></div><p>${correct} / ${attempted} correct · ${attempted?Math.round(correct/attempted*100):0}% accuracy</p>${!practice?'<p>Your teacher’s host screen will show the class podium after final scores arrive.</p>':''}<h2>Next things to revisit</h2>${Object.keys(misses).length?'<ul>'+Object.entries(misses).map(([l,n])=>`<li>Lesson ${esc(l)} · ${n} missed decision${n===1?'':'s'}</li>`).join('')+'</ul>':'<p>No missed decisions recorded.</p>'}<button class="b-primary" id="again">${practice?'Choose another practice':'Back to lobby'}</button></section>`;document.getElementById('again').onclick=()=>{screen=practice?'practice':'lobby';render();};return;}
 const c=deck[idx],q=c.questions[rung];
 app.innerHTML=`<div class="hud"><span>${practice?'PRACTICE':esc(code)} · <b id="clock"></b></span><span>${score} POINTS · ${correct}/${attempted} CORRECT</span></div><div class="play-grid"><section class="evidence"><span class="eyebrow">${c.lesson} · Ladder ${idx+1} of ${deck.length}</span><h1>${esc(c.title)}</h1><p class="context">${esc(c.context)}</p><figure>${visual(c.visual)}</figure><div class="evidence-note">Keep this evidence for all three decisions.</div></section><section class="decision"><ol class="ladder" aria-label="Ladder progress">${['Notice','Connect','Conclude'].map((s,i)=>`<li class="${i===rung?'active':i<rung?'done':''}" ${i===rung?'aria-current="step"':''}><b>${i+1}</b> ${s}</li>`).join('')}</ol><h2 tabindex="-1" id="question">${esc(q.prompt)}</h2><div class="choices">${q.options.map((o,i)=>`<button data-choice="${i}" ${picked!==null?'disabled':''} class="choice ${picked!==null&&o.correct?'right':picked===i?'wrong':''}"><span>${i+1}</span>${esc(o.text)}${picked!==null&&o.correct?' ✓':''}</button>`).join('')}</div>${picked!==null?`<div class="feedback" role="status"><strong>${q.options[picked].correct?'Correct · +10':'The twist to remember'}</strong><p>${esc(q.explanation)}</p><button class="b-primary" id="next">${rung<2?'Next rung →':idx<deck.length-1?'Next ladder →':'Finish →'}</button></div>`:'<p class="hint">Choose 1, 2 or 3. No speed bonus.</p>'}</section></div>`;
 app.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.choice)));
 document.getElementById('next')?.addEventListener('click',()=>{picked=null;if(++rung===3){rung=0;idx++;}if(idx===deck.length){finish();return;}render();document.getElementById('question').focus();});clock();
}
function answer(i){if(screen!=='play'||picked!==null||(!practice&&Date.now()>=end)){if(screen==='play'&&!practice&&Date.now()>=end)finish();return;}picked=i;attempted++;if(deck[idx].questions[rung].options[i].correct){correct++;score+=10;streak++;bestStreak=Math.max(bestStreak,streak);}else{streak=0;misses[deck[idx].lesson]=(misses[deck[idx].lesson]||0)+1;}progress();render();document.getElementById('next')?.focus();}
function clock(){if(screen!=='play')return;if(!practice&&Date.now()>=end){finish();return;}const el=document.getElementById('clock');if(el){const s=Math.max(0,Math.ceil((end-Date.now())/1000));el.textContent=practice?'NO TIMER':`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}${late?' · joined late':''}`;}}
function join(room){code=room;const hostLink=document.getElementById('teacherHostLink');if(hostLink)hostLink.href='host.html?code='+encodeURIComponent(room)+(E.preview?'':'&mode=live');screen='lobby';render();E.session.startPolling(code,2000,(g,meta)=>{
 if(!g){if(screen==='play'||screen==='countdown')finish();else{E.session.stopPolling();code='';screen='join';E.join.mount(app,join,meta?.retired?'Your teacher has a new room code.':'This room is no longer active.');}return;}
 const phase=E.session.derivePhase(g);
 if(g.round!==round&&(phase==='live'||phase==='countdown')){
  if(screen==='play'||screen==='countdown')finish();clearTimeout(flush);flush=null;cancel?.cancel();const plan=E.round.plan(g,false);if(!plan)return;round=g.round;end=plan.playEnd;late=plan.late;reset();deck=buildDeck(code+':'+round);
  if(plan.countdownEnd){screen='countdown';render();cancel=E.round.runCountdown(plan.countdownEnd,n=>E.ui.setMaskNum(n),()=>{cancel=null;screen='play';render();});}else{screen='play';render();}progress(true);
 }else if(g.round===round&&(screen==='play'||screen==='countdown')&&g.gameEndsAt<end){end=g.gameEndsAt;if(Date.now()>=end)finish();}
 });}
setInterval(clock,250);
setInterval(()=>{if(!practice&&code&&screen==='lobby')E.players.pushWaitingPresence({code,studentId:E.identity.studentId,displayName:E.identity.displayName,period:E.identity.period});},10000);
document.addEventListener('keydown',e=>{if(screen==='play'&&picked===null&&/^[123]$/.test(e.key)&&!e.repeat&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();answer(Number(e.key)-1);}});
window.PlotTwist={buildDeck,visual};
if(practice)screen='practice';render();
})();
