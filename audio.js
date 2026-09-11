/* Host-only Web Audio. Decoded buffers, overlapping loops and scheduled envelopes. */
(function(){
  'use strict';
  let ctx, master, phase='', generation=0, channel=null, muted=Engine.storage.read('muted',false), volume=Engine.storage.read('volume',0.38), blocked=false;
  const buffers=new Map(), channels=new Set();let activeCue=null;
  function notify(){window.dispatchEvent(new CustomEvent('engineaudiochange'));}
  async function unlock(){
    try {
      if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=muted?0:volume;master.connect(ctx.destination);}
      await ctx.resume(); blocked=ctx.state!=='running'; notify();
      // Fetch/decode only on the teacher's first gesture, never on student pages.
      Object.values(Engine.config().music||{}).forEach(src=>load(src).catch(()=>{}));
      if(phase && !channel && !muted) playFor(phase,true);
    }catch(_){blocked=true;notify();}
  }
  function load(src){
    if(!buffers.has(src)) buffers.set(src,fetch(src).then(r=>{if(!r.ok)throw new Error('audio_missing');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(e=>{buffers.delete(src);throw e;}));
    return buffers.get(src);
  }
  function ramp(param,target,seconds){
    const now=ctx.currentTime;
    if(param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
    else {const value=param.value;param.cancelScheduledValues(now);param.setValueAtTime(value,now);}
    param.linearRampToValueAtTime(target,now+seconds);
  }
  function retire(ch,seconds=2){
    if(!ch||ch.stopped)return;
    ch.stopped=true; clearTimeout(ch.timer); ramp(ch.gain.gain,0,seconds);
    setTimeout(()=>{ch.sources.forEach(s=>{try{s.stop();s.disconnect();}catch(_){}});ch.gain.disconnect();channels.delete(ch);},seconds*1000+100);
  }
  function makeLoop(buffer,src,target){
    const gain=ctx.createGain();gain.gain.value=0;gain.connect(master);
    const ch={gain,src,sources:new Set(),stopped:false,timer:null};channels.add(ch);
    const overlap=Math.min(1.4,buffer.duration/8),stride=buffer.duration-overlap;
    function schedule(at){
      if(ch.stopped)return;
      const source=ctx.createBufferSource(),env=ctx.createGain();source.buffer=buffer;source.connect(env);env.connect(gain);ch.sources.add(source);
      env.gain.setValueAtTime(0,at);env.gain.linearRampToValueAtTime(1,at+overlap);
      env.gain.setValueAtTime(1,at+stride);env.gain.linearRampToValueAtTime(0,at+buffer.duration);
      source.start(at);source.onended=()=>{ch.sources.delete(source);source.disconnect();env.disconnect();};
      // Schedule the following buffer before the overlap; timers never choose its start time.
      const next=at+stride;
      ch.timer=setTimeout(()=>schedule(Math.max(next,ctx.currentTime+0.02)),Math.max(0,(next-ctx.currentTime-2)*1000));
    }
    schedule(ctx.currentTime+0.03);ramp(gain.gain,target,2.4);return ch;
  }
  async function playFor(next,force=false){
    if(next===phase&&!force)return;
    if(activeCue && next!=='ended'){
      const cue=activeCue;activeCue=null;ramp(cue.gain.gain,0,.5);
      setTimeout(()=>{try{cue.source.stop();}catch(_){}},550);
    }
    phase=next;const token=++generation;
    const music=Engine.config().music||{};
    // Keep the lobby composition through the five-second countdown, gently ducked.
    const src=next==='countdown'?music.idle:music[next];
    const target=next==='countdown'?0.42:1;
    if(!ctx||ctx.state!=='running'){blocked=!!src&&!muted;notify();return;}
    if(!src){retire(channel,2.2);channel=null;return;}
    if(channel&&channel.src===src&&!channel.stopped){ramp(channel.gain.gain,target,1.2);return;}
    try {
      const buffer=await load(src);if(token!==generation)return;
      const outgoing=channel;channel=makeLoop(buffer,src,target);retire(outgoing,2.4);blocked=false;notify();
    }catch(_){blocked=true;notify();}
  }
  function setMuted(value){muted=!!value;Engine.storage.write('muted',muted);if(master)ramp(master.gain,muted?0:volume,0.35);notify();}
  function setVolume(value){volume=Math.max(0,Math.min(0.8,Number(value)));Engine.storage.write('volume',volume);if(master&&!muted)ramp(master.gain,volume,0.2);}
  const celebrated=new Set();
  async function fanfare(key){
    if(celebrated.has(key))return;
    celebrated.add(key);playFor('ended');
    if(!ctx||muted||ctx.state!=='running')return;
    try {
      const buffer=await load('../audio-release/fanfare.mp3');
      if(phase!=='ended')return;
      const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.value=0.85;source.connect(gain);gain.connect(master);
      activeCue={source,gain};source.start(ctx.currentTime+0.2);source.onended=()=>{source.disconnect();gain.disconnect();if(activeCue?.source===source)activeCue=null;};
    }catch(_){blocked=true;notify();}
  }
  Engine.audio={unlock,playFor,fanfare,setMuted,setVolume,isMuted:()=>muted,volume:()=>volume,needsGesture:()=>blocked,stop:()=>{phase='';generation++;channels.forEach(ch=>retire(ch));channel=null;}};
})();
