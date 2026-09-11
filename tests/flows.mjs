import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {createRequire} from 'node:module';

const require=createRequire(process.env.GAMES_TEST_PACKAGE || import.meta.url);
const {parseHTML}=require('linkedom');
const root=path.resolve(import.meta.dirname,'..');

class Store{
  data=new Map();
  get length(){return this.data.size;}
  key(i){return [...this.data.keys()][i];}
  getItem(k){return this.data.get(k)??null;}
  setItem(k,v){this.data.set(k,String(v));}
  removeItem(k){this.data.delete(k);}
}

class Clock{
  now=1800000000000;id=0;tasks=new Map();
  add(fn,ms,repeat){const id=++this.id;this.tasks.set(id,{fn,at:this.now+(Number(ms)||0),repeat});return id;}
  async advance(ms){
    const end=this.now+ms;
    for(let guard=0;guard<30000;guard++){
      await new Promise(setImmediate);
      let next=null;
      for(const [id,t] of this.tasks)if(t.at<=end&&(!next||t.at<next[1].at))next=[id,t];
      if(!next){this.now=end;await new Promise(setImmediate);return;}
      const [id,t]=next;this.now=t.at;
      if(t.repeat)t.at+=t.repeat;else this.tasks.delete(id);
      t.fn();
    }
    throw new Error('Timer loop');
  }
}

class MockApi{
  games=new Map();players=new Map();runs=new Map();calls=[];failNextSave=false;saveDelayMs=0;
  students=new Map([['9001',{found:true,studentId:'9001',displayName:'Ada',period:'2'}]]);
  constructor(clock){this.clock=clock;}
  response(value){return {ok:true,json:async()=>value};}
  async fetch(url,options={}){
    let action,args;
    if(options.method==='POST')({action,...args}=JSON.parse(options.body));
    else {const parsed=new URL(url);action=parsed.searchParams.get('action');args=Object.fromEntries(parsed.searchParams);delete args.action;}
    this.calls.push({action,args});
    if(action==='getStudent')return this.response(this.students.get(String(args.id))||{found:false});
    if(action==='getGame')return this.response(this.games.get(args.code)||{exists:false});
    if(action==='getPlayers')return this.response(this.rows(this.players,args));
    if(action==='getLeaderboard')return this.response(this.rows(this.runs,args));
    if(action==='createGame'){
      if(this.games.has(args.code))return this.response({error:'code_exists'});
      if(args.retireCode&&this.games.has(args.retireCode))this.games.set(args.retireCode,{...this.games.get(args.retireCode),retired:true});
      this.games.set(args.code,{exists:true,code:args.code,gameType:args.gameType,round:0,durationSec:0,countdownEndsAt:0,gameEndsAt:0,startedAt:0,retired:false});
      return this.response({ok:true,code:args.code});
    }
    const game=this.games.get(args.code);
    if(!game||game.retired)return this.response({error:'not_found'});
    if(action==='startRound'){
      this.games.set(args.code,{...game,...args,exists:true,startedAt:this.clock.now});
      return this.response({ok:true});
    }
    if(action==='endRound'){
      this.games.set(args.code,{...game,countdownEndsAt:Math.min(game.countdownEndsAt,this.clock.now),gameEndsAt:this.clock.now});
      return this.response({ok:true});
    }
    if(action==='updatePlayer'){
      const key=[args.code,args.round,args.studentId].join(':');this.players.set(key,{...args,updatedAt:this.clock.now});
      return this.response({ok:true});
    }
    if(action==='saveRun'){
      if(this.failNextSave){this.failNextSave=false;return this.response({error:'temporary_test_failure'});}
      if(this.saveDelayMs)await new Promise(resolve=>this.clock.add(resolve,this.saveDelayMs,0));
      const key=[args.gameType,args.code,args.round,args.studentId].join(':');this.runs.set(key,{...args,ts:args.ts||this.clock.now});
      return this.response({ok:true});
    }
    return this.response({error:'unknown_action'});
  }
  rows(source,args){
    return [...source.values()].filter(row=>(!args.code||row.code===args.code)&&(!args.gameType||row.gameType===args.gameType)&&(args.round===undefined||String(row.round)===String(args.round))).sort((a,b)=>b.score-a.score);
  }
}

function page(file,clock,storage,api,search=''){
  const html=fs.readFileSync(path.join(root,file),'utf8'),dom=parseHTML(html),document=dom.document;
  const events=new dom.window.EventTarget();
  const location=new URL('https://classroom.test/'+file+search);
  class FakeDate extends Date{constructor(...args){super(...(args.length?args:[clock.now]));}static now(){return clock.now;}}
  const proto=dom.window.HTMLElement.prototype;
  proto.focus=function(){document._focused=this;};proto.setSelectionRange=function(a,b){this.selectionStart=a;this.selectionEnd=b;};
  proto.showModal=function(){this.open=true;};proto.close=function(){this.open=false;};
  let fanfares=0;
  const sandbox={document,location,localStorage:storage,sessionStorage:new Store(),console,URL,URLSearchParams,crypto:webcrypto,Date:FakeDate,Math,Object,Map,Set,Uint8Array,AbortController,
    Event:dom.window.Event,CustomEvent:dom.window.CustomEvent,
    setTimeout:(f,m)=>clock.add(f,m,0),clearTimeout:id=>clock.tasks.delete(id),setInterval:(f,m)=>clock.add(f,m,m),clearInterval:id=>clock.tasks.delete(id),
    addEventListener:(...a)=>events.addEventListener(...a),dispatchEvent:(...a)=>events.dispatchEvent(...a),
    navigator:{clipboard:{writeText:async()=>{}}},matchMedia:()=>({matches:false,addEventListener(){}}),
    fetch:(...args)=>api.fetch(...args)};
  sandbox.window=sandbox;const context=vm.createContext(sandbox);
  for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
    const src=match[1].match(/src="([^"]+)"/)?.[1];
    if(src?.startsWith('http')||src?.includes('vendor/katex'))continue;
    if(src&&/audio(?:-b)?\.js$/.test(src)){sandbox.Engine.audio={unlock:async()=>{},playFor(){},fanfare(){fanfares++;},setMuted(){},isMuted:()=>false,needsGesture:()=>false,setVolume(){},volume:()=>.4};continue;}
    const code=src?fs.readFileSync(path.resolve(root,path.dirname(file),src),'utf8'):match[2];
    if(code.trim())vm.runInContext(code,context,{filename:src||file});
  }
  const click=selector=>{const el=document.querySelector(selector);assert(el,'Missing control '+selector+' in '+file);el.dispatchEvent(new dom.window.Event('click',{bubbles:true}));};
  const input=(selector,value)=>{const el=document.querySelector(selector);assert(el,'Missing input '+selector);el.value=value;el.selectionStart=value.length;el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));return el;};
  const key=(selector,value)=>{const event=new dom.window.Event('keydown',{bubbles:true,cancelable:true});event.key=value;document.querySelector(selector).dispatchEvent(event);};
  const submit=()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  return {context,sandbox,document,click,input,key,submit,fanfares:()=>fanfares,Event:dom.window.Event};
}

function answer(student,slug){
  const d=student.document;
  if(slug==='spot-the-error'){student.click('#cleanChoice');return;}
  if(slug==='skew-the-feed'){student.click('[data-cat="clean"]');return;}
  const bank=student.sandbox.CARDS,text=d.getElementById('app').textContent;
  const card=bank.find(c=>c.kind==='build'&&text.includes(c.title));assert(card,'Expected initial build card');
  d.querySelectorAll('select[data-field]').forEach((sel,i)=>{
    const option=[...sel.querySelectorAll('option')].find(o=>o.textContent===card.fields[i].correctText);assert(option);
    Object.defineProperty(sel,'value',{value:option.value,writable:true,configurable:true});sel.dispatchEvent(new student.Event('change',{bubbles:true}));
  });
  student.click('#submitBtn');
}

function plotState(page){
  const title=page.document.querySelector('.evidence h1')?.textContent;
  const prompt=page.document.getElementById('question')?.textContent;
  const item=page.sandbox.PLOT_CASES.find(c=>c.title===title);assert(item,'Current Plot Twist ladder is in the question bank');
  const question=item.questions.find(q=>q.prompt===prompt);assert(question,'Current Plot Twist decision is in its ladder');
  const correctText=question.choices[question.answer];
  const choice=[...page.document.querySelectorAll('[data-choice]')].find(button=>button.textContent.includes(correctText));
  assert(choice,'Correct Plot Twist option is rendered');
  return {visual:item.visual,selector:`[data-choice="${choice.dataset.choice}"]`};
}

function chooseSelect(page,select,value){
  const element=page.document.querySelector(select);assert(element,'Missing select '+select);
  Object.defineProperty(element,'value',{value:String(value),writable:true,configurable:true});
  element.dispatchEvent(new page.Event('change',{bubbles:true}));
}

function doublePracticeAnswer(page,correct){
  const title=page.document.querySelector('h2.title')?.textContent;
  const card=page.sandbox.CARDS.find(item=>item.title===title);assert(card,'Current Double-Blind card is in the bank');
  if(card.kind==='build'){
    page.document.querySelectorAll('select[data-field]').forEach((select,index)=>{
      const options=[...select.querySelectorAll('option')];
      const wanted=correct?card.fields[index].correctText:options.find(option=>option.value&&option.textContent!==card.fields[index].correctText).textContent;
      const option=options.find(item=>item.textContent===wanted);chooseSelect(page,`select[data-field="${index}"]`,option.value);
    });
    page.click('#submitBtn');page.click('#submitBtn');
  }else{
    const stronger=[...page.document.querySelectorAll('[data-pick]')].find(button=>page.document.getElementById('ms'+button.dataset.pick).textContent.includes(card.strongerText)).dataset.pick;
    const pick=correct?stronger:(stronger==='A'?'B':'A');page.click(`[data-pick="${pick}"]`);page.click(`[data-pick="${pick}"]`);
    const reason=[...page.document.querySelectorAll('[data-reason]')].find(button=>correct?button.textContent===card.correctReasonText:button.textContent!==card.correctReasonText);
    page.click(`[data-reason="${reason.dataset.reason}"]`);page.click(`[data-reason="${reason.dataset.reason}"]`);
  }
}

function spotPracticeAnswer(page,correct){
  const text=page.document.getElementById('app').textContent;
  const card=page.sandbox.BANK.find(item=>text.includes(item.given));assert(card,'Current Spot the Error problem is in the bank');
  if(!correct){
    if(card.errorStepIndex===null)page.click('[data-step-index="0"]');else page.click('#cleanChoice');
  }else if(card.errorStepIndex===null)page.click('#cleanChoice');
  else {page.click(`[data-step-index="${card.errorStepIndex}"]`);page.click(`[data-cat="${card.errorCategory}"]`);}
  const repeat=card.errorStepIndex===null?'#cleanChoice':correct?`[data-cat="${card.errorCategory}"]`:'#cleanChoice';
  page.click(repeat);
}

function skewPracticeAnswer(page,correct){
  const handle=page.document.querySelector('.post-handle')?.textContent;
  const card=page.sandbox.BANK.find(item=>item.handle===handle);assert(card,'Current Skew the Feed post is in the bank');
  const choice=correct?card.cat:Object.keys({under:1,nonresponse:1,voluntary:1,wording:1,clean:1}).find(key=>key!==card.cat);
  page.click(`[data-cat="${choice}"]`);page.click(`[data-cat="${choice}"]`);
}

for(const slug of ['spot-the-error','double-blind','skew-the-feed']){
  const clock=new Clock(),storage=new Store(),api=new MockApi(clock),host=page(slug+'/host.html',clock,storage,api,'?mode=demo');
  host.click('[data-action="create"]');await clock.advance(100);
  const code=host.sandbox.Engine.session.getCurrent().code;assert.match(code,/^[A-HJKMNP-Z2-9]{4}$/);
  assert.equal(host.sandbox.Engine.config().gameType,{ 'spot-the-error':'spot-the-error-derivatives','double-blind':'double-blind','skew-the-feed':'skew-the-feed'}[slug]);
  assert(api.calls.some(c=>c.action==='createGame'),'Ordinary and mode-tagged URLs use the API');
  const student=page(slug+'/index.html',clock,storage,api,'?mode=demo');
  student.input('#bCode','abc');student.key('#bCode','Enter');assert.equal(student.document.getElementById('bJoinError').textContent,'Enter all four characters of the game code.');
  const codeEl=student.input('#bCode','a b-cd');assert.equal(codeEl.value,'ABCD');
  student.input('#bCode',code);student.key('#bCode','Enter');assert.equal(student.document._focused.id,'bId','Enter moves from code to ID');
  student.input('#bId','9999');student.submit();student.submit();await clock.advance(100);
  assert.match(student.document.getElementById('bJoinError').textContent,/not on the roster/);
  assert.equal(student.document.getElementById('bCode').value,code,'Error preserves code');
  assert.equal(api.calls.filter(c=>c.action==='getStudent'&&c.args.id==='9999').length,1,'Duplicate submit is blocked');
  if(slug==='spot-the-error')student.document.getElementById('bRemember').checked=true;
  student.input('#bId','9001');student.submit();await clock.advance(100);
  assert(student.document.querySelector('.b-lobby'),'Successful join reaches lobby');
  assert.equal(student.sandbox.Engine.storage.read('remembered',''),slug==='spot-the-error'?'9001':'','Remembering an ID is opt-in');
  await clock.advance(6000);assert.equal(host.document.getElementById('rosterCount').textContent,'1');
  if(slug==='double-blind')api.saveDelayMs=8000;
  if(slug==='skew-the-feed')api.failNextSave=true;
  host.click('[data-action="start"]');await clock.advance(8000);
  assert(!student.document.querySelector('#bJoinForm'),'Round left registration');
  answer(student,slug);
  if(slug==='spot-the-error')await clock.advance(320000);
  else {
    await clock.advance(305000);
    assert(!host.document.querySelector('.b-podium'),'Podium waits while a result is delayed or unsaved');
    await clock.advance(20000);
    if(slug==='skew-the-feed'){
      assert.match(student.document.getElementById('bSaveStatus').textContent,/kept on this device/);
      student.click('#bSaveStatus button');await clock.advance(20000);
    }
  }
  assert.match(student.document.getElementById('bSaveStatus').textContent,/Result saved/);
  assert(host.document.querySelector('.b-podium'),'Full round reveals podium after confirmed save');
  assert.equal(host.fanfares(),1,'One fanfare per completed round');
  await clock.advance(8000);assert.equal(host.fanfares(),1,'Fanfare does not repeat');
  assert.equal([...api.runs.values()].filter(r=>r.round===1).length,1,'One final result is saved');
  host.click('[data-action="next"]');await clock.advance(100);host.click('[data-action="start"]');await clock.advance(3000);
  assert(student.document.querySelector('#countMask'),'Student received the next-round countdown');
  host.click('[data-action="stop"]');await clock.advance(100);host.click('[data-action="confirm-stop"]');await clock.advance(22000);
  assert.match(host.document.getElementById('hostMain').textContent,/Round stopped/);
  assert.equal(host.fanfares(),1,'Countdown stop never celebrates');
  const second=[...api.runs.values()].filter(r=>r.round===2);
  assert(second.length>0&&second.every(r=>r.score===0&&r.attempted===0),'Countdown stop does not reuse the previous score: '+JSON.stringify(second));
  console.log('PASS',slug,': production API, entry flow, roster, round sync, confirmed podium, fanfare, and countdown stop.');
}

{
  const clock=new Clock(),storage=new Store(),api=new MockApi(clock),host=page('plot-twist/host.html',clock,storage,api,'?mode=demo');
  assert.equal(host.sandbox.Engine.preview,false,'Plot Twist preview stays disabled even on a mode-tagged URL');
  assert.equal(host.sandbox.Engine.config().gameType,'plot-twist');
  host.click('[data-action="create"]');await clock.advance(100);
  const code=host.sandbox.Engine.session.getCurrent().code;
  assert(api.calls.some(c=>c.action==='createGame'),'Plot Twist production host uses the API');

  const student=page('plot-twist/index.html',clock,storage,api,'?mode=demo');
  student.input('#bCode',code);student.input('#bId','9001');student.submit();await clock.advance(100);
  assert(student.document.querySelector('.b-lobby'),'Plot Twist student reaches the room lobby');
  const hostHref=student.document.getElementById('teacherHostLink').getAttribute('href');
  assert(hostHref.includes('code='+code),'Teacher host link keeps the joined room code');
  assert(hostHref.includes('mode=live'),'Teacher host link explicitly stays in production mode');

  await clock.advance(6000);
  assert.equal(host.document.getElementById('rosterCount').textContent,'1');
  host.click('[data-minutes="3"]');host.click('[data-action="start"]');await clock.advance(8000);
  assert(student.document.querySelector('[data-choice]'),'Plot Twist enters the decision ladder');
  student.click(plotState(student).selector);
  await clock.advance(200000);
  assert.match(student.document.getElementById('bSaveStatus').textContent,/Result saved/);
  assert(host.document.querySelector('.b-podium'),'A completed Plot Twist round reveals confirmed results');
  assert.equal(host.fanfares(),1,'A completed Plot Twist round plays one fanfare');
  await clock.advance(8000);assert.equal(host.fanfares(),1,'Plot Twist fanfare does not repeat');

  host.click('[data-action="next"]');await clock.advance(100);host.click('[data-action="start"]');await clock.advance(3000);
  host.click('[data-action="stop"]');await clock.advance(100);host.click('[data-action="confirm-stop"]');await clock.advance(22000);
  assert.match(host.document.getElementById('hostMain').textContent,/Round stopped/);
  assert.equal(host.fanfares(),1,'An early Plot Twist stop does not celebrate');
  console.log('PASS plot-twist: production config, same-room host link, round sync, confirmed podium, one fanfare, and quiet early stop.');
}

{
  const clock=new Clock(),storage=new Store(),api=new MockApi(clock),practice=page('plot-twist/index.html',clock,storage,api,'?practice=1');
  assert.match(practice.document.getElementById('app').textContent,/Untimed Practice · no ID required · no scores sent/);
  assert.equal(api.calls.length,0,'Opening Plot Twist practice does not contact the classroom API');
  practice.click('#practiceStart');
  const imageRefs=new Set();
  for(let decision=0;decision<132;decision++){
    const {visual,selector}=plotState(practice);
    const figure=practice.document.querySelector('.evidence figure');assert(figure,'Every Plot Twist decision renders its statistical evidence');
    if(visual.type==='image'){
      const img=figure.querySelector('img.statistical-image');assert(img,'Referenced statistical graphic renders as an image');
      const src=img.getAttribute('src');imageRefs.add(src);assert(fs.existsSync(path.join(root,'plot-twist',src)),'Rendered graphic exists: '+src);
    }else assert(figure.children.length>0,'Generated statistical graphic is not empty');
    practice.click(selector);practice.click('#next');
  }
  assert.match(practice.document.getElementById('app').textContent,/Practice complete/);
  assert.equal(api.calls.length,0,'Completing all 132 practice decisions sends no classroom writes');
  assert.deepEqual([...imageRefs].sort(),['graphics/aim-and-scatter.svg','graphics/axis-of-deception.svg','graphics/lunch-vote.svg','graphics/parts-of-a-whole.svg','graphics/two-rules.svg']);
  console.log('PASS plot-twist practice: all 132 decisions render, every bundled statistical graphic is reached, and no scores are sent.');
}

for(const spec of [
  {slug:'double-blind',filter:'1',total:10,all:30,next:'#nextBtn',answer:doublePracticeAnswer},
  {slug:'spot-the-error',filter:'conceptual',total:6,all:54,next:'#practiceNextBtn',answer:spotPracticeAnswer},
  {slug:'skew-the-feed',filter:'voluntary',total:7,all:45,next:'#practiceNextBtn',answer:skewPracticeAnswer}
]){
  {
    const clock=new Clock(),storage=new Store(),api=new MockApi(clock),all=page(spec.slug+'/index.html',clock,storage,api,'?practice=1');
    assert.match(all.document.body.textContent,/Untimed Practice/);
    assert.match(all.document.querySelector('#practiceTopic option').textContent,/All content/);
    all.click('#practiceStartBtn');
    assert.match(all.document.querySelector('.practice-progress').textContent,new RegExp('1 of '+spec.all));
    await clock.advance(400000);
    assert.match(all.document.querySelector('.practice-progress').textContent,new RegExp('1 of '+spec.all),'Practice survives beyond a classroom round without advancing');
    assert.equal(api.calls.length,0,'All-content practice never contacts the backend');
  }

  const clock=new Clock(),storage=new Store(),api=new MockApi(clock);
  storage.setItem('games:remembered',JSON.stringify('9001'));
  storage.setItem('games:pending:OLD:1:9001',JSON.stringify({gameType:spec.slug==='spot-the-error'?'spot-the-error-derivatives':spec.slug,code:'OLD',round:1,studentId:'9001',score:10}));
  const practice=page(spec.slug+'/index.html',clock,storage,api,'?practice=1');
  assert(practice.document.querySelectorAll('#practiceTopic option').length>1,'Practice offers an authored content selector');
  chooseSelect(practice,'#practiceTopic',spec.filter);practice.click('#practiceStartBtn');
  assert.match(practice.document.querySelector('.practice-progress').textContent,new RegExp('1 of '+spec.total));
  spec.answer(practice,false);
  assert(practice.document.querySelector(spec.next),'Incorrect feedback waits for manual advancement');
  await clock.advance(20000);
  assert(practice.document.querySelector(spec.next),'Feedback remains visible without automatic advancement');
  practice.click(spec.next);
  for(let guard=0;guard<spec.total+2&&!/Practice Complete/i.test(practice.document.getElementById('app').textContent);guard++){
    spec.answer(practice,true);
    assert(practice.document.querySelector(spec.next),'Correct feedback provides manual advancement');
    practice.click(spec.next);
  }
  const results=practice.document.getElementById('app').textContent;
  assert.match(results,/Practice Complete/i);
  assert.match(results,new RegExp(String(spec.total)+'Attempts','i'),'Completion reports every attempted item once');
  assert.match(results,/Topics? to revisit|Content bands to revisit/i);
  assert(practice.document.getElementById('practiceAgainBtn'),'Completion offers replay');
  assert(practice.document.getElementById('practiceChooseBtn'),'Completion offers a different selection');
  assert.equal(practice.document.getElementById('practiceAgainBtn').closest('.summary,.card').querySelector('a[href="index.html"]').textContent,'Classroom entry');
  assert.equal(api.calls.length,0,'Practice ignores saved identity and pending classroom data without reads or writes');
  practice.click('#practiceChooseBtn');
  assert(practice.document.getElementById('practiceTopic'),'Choose different content returns to the selector');
  chooseSelect(practice,'#practiceTopic',spec.filter);practice.click('#practiceStartBtn');
  for(let guard=0;guard<spec.total+2&&!/Practice Complete/i.test(practice.document.getElementById('app').textContent);guard++){
    spec.answer(practice,true);practice.click(spec.next);
  }
  assert.match(practice.document.getElementById('app').textContent,/Practice Complete/i);
  practice.click('#practiceAgainBtn');
  assert.match(practice.document.querySelector('.practice-progress').textContent,new RegExp('1 of '+spec.total),'Replay starts a fresh finite practice deck');
  console.log('PASS',spec.slug,'practice: visible setup, all/topic decks, untimed manual feedback, duplicate protection, completion/replay, and zero backend traffic.');
}

{
  const clock=new Clock(),storage=new Store(),api=new MockApi(clock),wrongHost=page('spot-the-error/host.html',clock,storage,api);
  wrongHost.click('[data-action="create"]');await clock.advance(100);const code=wrongHost.sandbox.Engine.session.getCurrent().code;
  const student=page('skew-the-feed/index.html',clock,storage,api);student.input('#bCode',code);student.input('#bId','9001');student.submit();await clock.advance(100);
  assert.match(student.document.getElementById('bJoinError').textContent,/different game/);
  assert.equal(api.calls.filter(c=>c.action==='getStudent').length,0,'Wrong-game code is rejected before roster lookup');
  console.log('PASS wrong-game code is rejected before identity or presence writes.');
}

{
  const clock=new Clock(),storage=new Store(),api=new MockApi(clock),code='SAVE';
  api.games.set(code,{exists:true,code,gameType:'skew-the-feed',round:4,durationSec:300,countdownEndsAt:clock.now-310000,gameEndsAt:clock.now-10000,startedAt:clock.now-315000,retired:false});
  const payload={gameType:'skew-the-feed',code,round:4,studentId:'9001',displayName:'Ada',period:'2',score:40,correct:4,attempted:5,accuracy:80,bestStreak:3,ts:clock.now-10000};
  storage.setItem('games-b:live:pending:SAVE:4:9001',JSON.stringify(payload));
  storage.setItem('engine_audioMuted','1');
  const student=page('skew-the-feed/index.html',clock,storage,api);await clock.advance(100);
  assert.equal(student.sandbox.Engine.storage.read('muted',false),true,'Existing mute preference migrates');
  assert.equal([...api.runs.values()].length,1,'Pending result from the prior release is recovered');
  assert.equal(storage.getItem('games-b:live:pending:SAVE:4:9001'),null,'Recovered legacy pending entry is cleared');
  console.log('PASS saved preferences and pending-result recovery survive the release transition.');
}

console.log('All production host/student flows passed against the isolated API mock. No classroom writes were made.');
