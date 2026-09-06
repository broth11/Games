import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const bankMatch = html.match(/var BANK = (\[[\s\S]*?\n\]);\n\n  var CATS/);
assert(bankMatch, 'Could not locate BANK');
const BANK = JSON.parse(bankMatch[1]);
assert.equal(BANK.length, 54, 'Expected 54 bank items');

function extractFunction(name) {
  const start = html.indexOf(`function ${name}(`);
  assert(start >= 0, `Could not locate ${name}`);
  const bodyStart = html.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < html.length; i += 1) {
    if (html[i] === '{') depth += 1;
    if (html[i] === '}') depth -= 1;
    if (depth === 0) return html.slice(start, i + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

const handlerSource = [
  'var TIER_POINTS = {foundational:10, structured:15, abstract:20};',
  'var CATS = Object.fromEntries(["power","chain","productQuotient","trigExpLog","algebraSimplification","unitsInterpretation","clean"].map(function(k){ return [k,{label:k}]; }));',
  'var state = {};',
  'var progressPushes = 0;',
  'function currentCard(){ return state.deck[state.idx]; }',
  'function render(){}',
  'function pushPlayerProgress(){ progressPushes += 1; }',
  'function clearInterval(){}',
  'function finishRun(){}',
  'function setTimeout(){ return 0; }',
  ...['recordMiss','awardStageOneCorrect','resolveStageOneMiss','finishItem','handleLocate','handleCategory','handleSkip'].map(extractFunction)
].join('\n\n');

const context = vm.createContext({ Math, Object, console });
vm.runInContext(handlerSource, context);

function tierPoints(card) {
  return { foundational: 10, structured: 15, abstract: 20 }[card.tier];
}

function freshState(card, extras = {}) {
  return {
    deck: [card], idx: 0, score: 0, streak: 0, bestStreak: 0,
    correct: 0, attempted: 0, misses: {}, answering: false,
    stage: 'locate', feedback: null,
    icons: { steps: {}, clean: '', categories: {} },
    screen: 'play', secondsLeft: 60, answerTimer: null, timerId: null,
    ...extras
  };
}

function use(card, extras) {
  context.state = freshState(card, extras);
  context.progressPushes = 0;
}

function correctLocate(card) {
  if (card.errorStepIndex === null) context.handleLocate('clean');
  else context.handleLocate(card.errorStepIndex);
}

function wrongStep(card) {
  return card.errorStepIndex === 0 ? 1 : 0;
}

function wrongCategory(card) {
  return ['power','chain','productQuotient','trigExpLog','algebraSimplification','unitsInterpretation']
    .find((category) => category !== card.errorCategory);
}

let correctPaths = 0;
let stageOneMisses = 0;
let categoryMisses = 0;
let locateSkips = 0;
let categorySkips = 0;

function assertStageOneMiss(card, label, action) {
  use(card, { streak: 4, bestStreak: 4 });
  action();
  assert.equal(context.state.score, 0, `${card.id}: ${label} earns zero`);
  assert.equal(context.state.streak, 0, `${card.id}: ${label} resets streak`);
  assert.equal(context.state.attempted, 1, `${card.id}: ${label} records attempt`);
  assert.equal(context.state.correct, 0, `${card.id}: ${label} records no correct`);
  assert.equal(context.progressPushes, 1, `${card.id}: ${label} progress push`);
  stageOneMisses += 1;
}

for (const card of BANK) {
  use(card);
  correctLocate(card);
  assert.equal(context.state.score, tierPoints(card), `${card.id}: Stage 1 full tier credit`);
  assert.equal(context.state.streak, 1, `${card.id}: Stage 1 increments streak`);
  assert.equal(context.state.correct, 1, `${card.id}: Stage 1 correct count`);
  assert.equal(context.state.attempted, 1, `${card.id}: Stage 1 attempted count`);
  assert.equal(context.progressPushes, 1, `${card.id}: Stage 1 progress push`);
  if (card.errorStepIndex === null) {
    assert.match(context.state.feedback.title, /Correct/, `${card.id}: clean final feedback`);
  } else {
    assert.equal(context.state.stage, 'classify', `${card.id}: correct locate enters Stage 2`);
    context.handleCategory(card.errorCategory);
    assert.equal(context.state.score, tierPoints(card) + 5, `${card.id}: Stage 2 +5 bonus`);
    assert.equal(context.state.streak, 1, `${card.id}: Stage 2 correct leaves streak unchanged`);
    assert.equal(context.progressPushes, 2, `${card.id}: Stage 2 progress push`);
  }
  correctPaths += 1;

  use(card, { streak: 4, bestStreak: 4 });
  context.handleSkip();
  assert.equal(context.state.score, 0, `${card.id}: locate skip earns zero`);
  assert.equal(context.state.streak, 0, `${card.id}: locate skip resets streak`);
  assert.equal(context.state.attempted, 1, `${card.id}: locate skip records attempt`);
  assert.equal(context.state.correct, 0, `${card.id}: locate skip records no correct`);
  assert.equal(context.state.misses[card.errorCategory || 'clean'], 1, `${card.id}: locate skip miss bucket`);
  assert.equal(context.progressPushes, 1, `${card.id}: locate skip progress push`);
  locateSkips += 1;

  if (card.errorStepIndex === null) {
    assertStageOneMiss(card, 'clean item + step', () => context.handleLocate(0));
  } else {
    assertStageOneMiss(card, 'error item + Clean', () => context.handleLocate('clean'));
    assertStageOneMiss(card, 'error item + wrong step', () => context.handleLocate(wrongStep(card)));
  }

  if (card.errorStepIndex !== null) {
    use(card, { streak: 2, bestStreak: 2 });
    correctLocate(card);
    const scoreAfterLocate = context.state.score;
    const streakAfterLocate = context.state.streak;
    context.handleCategory(wrongCategory(card));
    assert.equal(context.state.score, scoreAfterLocate, `${card.id}: wrong category has no half credit adjustment`);
    assert.equal(context.state.streak, streakAfterLocate, `${card.id}: wrong category leaves streak`);
    assert.equal(context.state.correct, 1, `${card.id}: wrong category preserves Stage 1 correct count`);
    assert.equal(context.state.attempted, 1, `${card.id}: wrong category preserves attempt count`);
    assert.equal(context.state.misses[card.errorCategory], 1, `${card.id}: wrong category miss bucket`);
    assert.match(context.state.feedback.title, /no \+5 bonus/, `${card.id}: wrong category feedback`);
    assert.equal(context.progressPushes, 2, `${card.id}: wrong category progress push`);
    categoryMisses += 1;

    use(card, { streak: 2, bestStreak: 2 });
    correctLocate(card);
    const scoreBeforeSkip = context.state.score;
    const streakBeforeSkip = context.state.streak;
    context.handleSkip();
    assert.equal(context.state.score, scoreBeforeSkip, `${card.id}: category skip leaves Stage 1 points`);
    assert.equal(context.state.streak, streakBeforeSkip, `${card.id}: category skip leaves streak`);
    assert.equal(context.state.correct, 1, `${card.id}: category skip preserves Stage 1 correct count`);
    assert.equal(context.state.attempted, 1, `${card.id}: category skip preserves attempt count`);
    assert.equal(context.state.misses[card.errorCategory], 1, `${card.id}: category skip miss bucket`);
    assert.match(context.state.feedback.title, /no \+5 bonus/, `${card.id}: category skip feedback`);
    assert.equal(context.progressPushes, 2, `${card.id}: category skip progress push`);
    categorySkips += 1;
  }
}

const milestoneCard = BANK.find((card) => card.errorStepIndex !== null);
use(milestoneCard, { streak: 2, bestStreak: 2 });
correctLocate(milestoneCard);
assert.equal(context.state.score, tierPoints(milestoneCard) + 5, 'third Stage 1 success includes the existing +5 streak bonus');
assert.equal(context.state.streak, 3, 'milestone increments at Stage 1');
context.handleCategory(wrongCategory(milestoneCard));
assert.equal(context.state.score, tierPoints(milestoneCard) + 5, 'Stage 2 miss cannot remove Stage 1 milestone points');
assert.equal(context.state.streak, 3, 'Stage 2 miss cannot reset milestone streak');

console.log(`PASS: ${correctPaths} correct flows; ${stageOneMisses} Stage 1 miss branches; ${locateSkips} locate skips; ${categoryMisses} wrong categories; ${categorySkips} category skips`);
