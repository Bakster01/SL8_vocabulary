import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize,checkAnswer,makeChoices,makeSession,restoreProgress,recordAnswer} from '../dist/core.mjs';
const e={id:'m1-a',word:'caring',meaning:'заботливый',answers:['caring'],translations:['заботливый']};
test('normalizes case, punctuation and Russian yo',()=>{assert.equal(normalize('  ПЕЧЁНЫЙ! '),'печеный');assert(checkAnswer(e,'Caring!'));assert(!checkAnswer(e,'caring extra'));});
test('distractors never contain accepted or duplicate meanings',()=>{const all=[e,{...e,id:'b',word:'kind'},{...e,id:'c',meaning:'добрый',translations:['добрый']},{...e,id:'d',meaning:'строгий',translations:['строгий']}];const choices=makeChoices(e,all,()=>.5);assert.equal(new Set(choices.map(x=>normalize(x.text))).size,choices.length);assert.equal(choices.filter(x=>x.correct).length,1);});
test('empty and short pools create safe bounded sessions',()=>{assert.deepEqual(makeSession([],10),[]);assert.equal(makeSession([e],10).length,1);});
test('corrupt and hostile progress recovers',()=>{assert.deepEqual(restoreProgress('bad'),{});assert.deepEqual(restoreProgress('{"a":{"attempts":-9}}'),{});});
test('assisted success never counts as independent success',()=>{const p={};recordAnswer(p,'m1-a',true,true);assert.equal(p['m1-a'].correct,0);assert.equal(p['m1-a'].attempts,1);assert.equal(p['m1-a'].assisted,1);recordAnswer(p,'m1-a',true,false);assert.equal(p['m1-a'].correct,1);assert.equal(p['m1-a'].needsReview,false);});

test('malformed saved session responses are rejected safely',async()=>{const {restoreSession}=await import('../dist/core.mjs');const base={ids:['m1-a'],position:0,mode:'spelling',responses:{0:{answer:null}},choices:[[{text:'x',correct:true}]]};assert.equal(restoreSession(base,new Set(['m1-a'])),null);assert.equal(restoreSession({...base,responses:{0:'bad'}},new Set(['m1-a'])),null);assert(restoreSession({...base,responses:{}},new Set(['m1-a'])));});

test('saved sessions preserve real answers and reject invalid positions, flags and choices',async()=>{
  const {restoreSession}=await import('../dist/core.mjs');
  const known=new Set(['m1-a']);
  const response={answer:'caring',checked:true,correct:true,assisted:false,recorded:true,revealed:false};
  const saved={ids:['m1-a'],position:0,mode:'spelling',responses:{0:response},choices:[[{text:'заботливый',correct:true}]]};
  assert.deepEqual(restoreSession(saved,known),saved);
  assert(restoreSession({...saved,position:1},known));
  for(const broken of [null,[],{...saved,ids:['unknown']},{...saved,position:-1},{...saved,position:2},{...saved,responses:[]},{...saved,responses:{2:response}},{...saved,responses:{0:{...response,checked:'yes'}}},{...saved,choices:[[null]]},{...saved,choices:[[{text:'x',correct:false}]]}])assert.equal(restoreSession(broken,known),null);
});
