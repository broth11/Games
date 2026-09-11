import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const runtimeFiles=['config.js','engine.js','student.js','host.js','audio.js','index.html',
  'spot-the-error/index.html','spot-the-error/host.html','double-blind/index.html','double-blind/host.html','skew-the-feed/index.html','skew-the-feed/host.html'];
const source=runtimeFiles.map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');

for(const pattern of [/mode=live/i,/mode=demo/i,/preview ids?/i,/solo preview/i,/30-second/i,/30 sec/i,/GAME_B_/i,/engine-b\.js/i,/student-b\.js/i,/host-b\.js/i,/audio-b/i,/version-b/i,/gameType\s*\+=/]){
  assert(!pattern.test(source),'Production runtime contains forbidden preview marker: '+pattern);
}

const brands=Object.fromEntries(['spot-the-error','double-blind','skew-the-feed'].map(slug=>{
  const text=fs.readFileSync(path.join(root,slug,'brand.js'),'utf8');
  const match=text.match(/"gameType":\s*"([^"]+)"/);assert(match,'Missing gameType for '+slug);return [slug,match[1]];
}));
assert.deepEqual(brands,{'spot-the-error':'spot-the-error-derivatives','double-blind':'double-blind','skew-the-feed':'skew-the-feed'});

for(const file of runtimeFiles.filter(file=>file.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const ref=match[1];if(/^(?:https?:|#|mailto:)/.test(ref))continue;
    const clean=ref.split(/[?#]/)[0];
    assert(fs.existsSync(path.resolve(root,path.dirname(file),clean)),file+' has missing local asset '+ref);
  }
}

const expectedAudio=['double-blind-idle.mp3','double-blind-live.mp3','fanfare.mp3','skew-the-feed-idle.mp3','skew-the-feed-live.mp3','spot-the-error-idle.mp3','spot-the-error-live.mp3'];
for(const file of expectedAudio)assert(fs.existsSync(path.join(root,'audio-release',file)),'Missing audio '+file);
assert(fs.existsSync(path.join(root,'vendor/katex/katex.min.js')),'Missing bundled KaTeX');
assert(!fs.existsSync(path.join(root,'site')),'ZIP site folder must not become a URL segment');
console.log('PASS static production audit: live-only runtime, stable identifiers, and complete local assets.');
