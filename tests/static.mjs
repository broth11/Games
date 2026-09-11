import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

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

const plotRoot=path.join(root,'plot-twist');
assert(fs.existsSync(plotRoot)&&fs.statSync(plotRoot).isDirectory(),'Plot Twist must be installed beside the existing games');
assert(!fs.existsSync(path.join(plotRoot,'plot-twist')),'Plot Twist must not be nested inside itself');
const plotFiles=['README.md','coverage.md','index.html','host.html','config.js','brand.js','questions.js','game.js','game.css','logo.png',
  'runtime/engine-b.js','runtime/student-b.js','runtime/host-b.js','runtime/audio-b.js','runtime/version-b.css',
  'audio-b/plot-twist-idle.mp3','audio-b/plot-twist-live.mp3','audio-b/fanfare.mp3',
  'graphics/lunch-vote.svg','graphics/axis-of-deception.svg','graphics/parts-of-a-whole.svg','graphics/two-rules.svg','graphics/aim-and-scatter.svg'];
for(const file of plotFiles)assert(fs.existsSync(path.join(plotRoot,file)),'Missing Plot Twist package file '+file);

const plotConfig=fs.readFileSync(path.join(plotRoot,'config.js'),'utf8');
assert.match(plotConfig,/"preview": false/,'Plot Twist must be production-only');
assert.match(plotConfig,/https:\/\/script\.google\.com\/macros\/s\/AKfycbwdGJAOLH5JskqJTckVxZuOGcu-nBAEj0DXe5M2tKcWHby4ZfVRM_1-IL11WA_g0iIr7Q\/exec/,'Plot Twist must retain the deployed Apps Script URL');
const plotBrand=fs.readFileSync(path.join(plotRoot,'brand.js'),'utf8');
assert.match(plotBrand,/gameType:\s*"plot-twist"/,'Plot Twist must use its stable production gameType');

for(const file of ['index.html','host.html']){
  const html=fs.readFileSync(path.join(plotRoot,file),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const ref=match[1];if(/^(?:https?:|#|mailto:|\?)/.test(ref))continue;
    const clean=ref.split(/[?#]/)[0];
    assert(fs.existsSync(path.resolve(plotRoot,path.dirname(file),clean)),`plot-twist/${file} has missing local asset ${ref}`);
  }
}

const questionContext={window:{}};vm.createContext(questionContext);
vm.runInContext(fs.readFileSync(path.join(plotRoot,'questions.js'),'utf8'),questionContext);
const cases=questionContext.window.PLOT_CASES;
assert.equal(cases.length,44,'Plot Twist must include all 44 question ladders');
assert.equal(cases.reduce((n,c)=>n+c.questions.length,0),132,'Plot Twist must include all 132 decisions');
const referencedGraphics=[...new Set(cases.map(c=>c.visual).filter(v=>v.type==='image').map(v=>v.src))].sort();
assert.deepEqual(referencedGraphics,['graphics/aim-and-scatter.svg','graphics/axis-of-deception.svg','graphics/lunch-vote.svg','graphics/parts-of-a-whole.svg','graphics/two-rules.svg']);
for(const ref of referencedGraphics)assert(fs.existsSync(path.join(plotRoot,ref)),'Missing referenced Plot Twist graphic '+ref);

const launcher=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(launcher,/href="plot-twist\/index\.html"/,'Launcher needs a Plot Twist student link');
assert.match(launcher,/href="plot-twist\/host\.html"/,'Launcher needs a Plot Twist teacher-host link');
console.log('PASS static production audit: four games, stable identifiers, and complete local assets.');
