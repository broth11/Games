import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const data={Students:[['id','last','first','nick','display','period'],['00123','One','Ada','','Ada','1']],Games:[Array(9).fill('header')],Players:[Array(12).fill('header')],Runs:[Array(12).fill('header')]};
let locked=false;
function sheet(name){return {
  getLastRow:()=>data[name].length,getLastColumn:()=>data[name][0].length,
  appendRow(row){assert(locked,'Writes require lock');data[name].push([...row]);},
  getRange(row,col,num=1,width=1){return {
    getValues:()=>Array.from({length:num},(_,i)=>Array.from({length:width},(_,j)=>data[name][row-1+i]?.[col-1+j]??'')),
    setValue(value){assert(locked);data[name][row-1][col-1]=value;},
    setValues(values){assert(locked);for(let i=0;i<num;i++)for(let j=0;j<width;j++)data[name][row-1+i][col-1+j]=values[i][j];}
  };}
};}
const s={SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:sheet})},LockService:{getScriptLock:()=>({waitLock(){assert(!locked);locked=true;},releaseLock(){locked=false;}})},Date,Number,String,Object,Math,JSON,isFinite,parseInt};
vm.createContext(s);vm.runInContext(fs.readFileSync(new URL('../backend/Code.gs',import.meta.url),'utf8'),s);
assert.equal(s.getStudent('00123').studentId,'00123','Leading zero ID retained');
assert.equal(s.getStudent('123').found,false,'Leading zero not silently removed');
assert.equal(s.createGame({code:'ABCD',gameType:'test-game'}).ok,true);
assert.equal(s.createGame({code:'ABCD',gameType:'test-game'}).error,'code_exists');
const end=Date.now()+5000;
const round={code:'ABCD',round:1,durationSec:30,countdownEndsAt:end,gameEndsAt:end+30000};
assert.equal(s.startRound(round).ok,true);assert.equal(s.startRound(round).ok,true,'Same round start is idempotent');
assert.throws(()=>s.startRound({...round,round:2}),/already_running/);
assert.equal(s.endRound({code:'ABCD'}).ok,true);
const player={code:'ABCD',round:1,gameType:'test-game',studentId:'00123',displayName:'Ada',period:'1',score:20,correct:1,attempted:1,accuracy:100,bestStreak:1};
assert.equal(s.saveRun(player).ok,true);assert.equal(s.saveRun(player).duplicate,true);assert.equal(data.Runs.length,2,'One final result after retry');
assert.equal(s.getLeaderboard('test-game',100,'ABCD',1).length,1);
assert.equal(s.getLeaderboard('other-game',100,'ABCD',1).length,0,'Game histories separated');
s.createGame({code:'WXYZ',gameType:'test-game',retireCode:'ABCD'});
assert.equal(s.getGame('ABCD').retired,true);
assert.throws(()=>s.startRound({...round,round:2}),/retired/);
assert.equal(locked,false,'Every write releases its lock');
console.log('PASS backend: roster IDs, unique codes, idempotent round start/final save, early stop, game filtering, retirement, lock discipline.');
