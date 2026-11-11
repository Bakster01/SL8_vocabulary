export const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/ё/g,'е').replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}']+/gu,' ').replace(/\s+/g,' ').trim();
export const checkAnswer=(entry,value)=>!!normalize(value)&&entry.answers.some(x=>normalize(x)===normalize(value));
export function shuffle(items,random=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export const makeSession=(pool,size=10)=>shuffle(pool).slice(0,size).map(e=>e.id);
export function restoreSession(saved,knownIds){
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  if(!object(saved)||!Array.isArray(saved.ids)||saved.ids.length<1||saved.ids.length>10||!saved.ids.every(id=>knownIds.has(id))||new Set(saved.ids).size!==saved.ids.length)return null;
  if(!Number.isInteger(saved.position)||saved.position<0||saved.position>saved.ids.length||!['recognition','spelling','listening'].includes(saved.mode))return null;
  if(!object(saved.responses)||!Array.isArray(saved.choices)||saved.choices.length!==saved.ids.length)return null;
  for(const choices of saved.choices){
    if(!Array.isArray(choices)||choices.length<1||choices.length>4||!choices.every(c=>object(c)&&typeof c.text==='string'&&typeof c.correct==='boolean')||choices.filter(c=>c.correct).length!==1)return null;
  }
  const flags=['checked','correct','assisted','recorded','revealed'];
  for(const [key,response] of Object.entries(saved.responses)){
    const index=Number(key);
    if(!Number.isInteger(index)||String(index)!==key||index<0||index>=saved.ids.length||!object(response)||typeof response.answer!=='string'||!flags.every(flag=>typeof response[flag]==='boolean'))return null;
    if(saved.mode!=='spelling'&&response.answer!==''&&(!/^\d+$/.test(response.answer)||Number(response.answer)>=saved.choices[index].length))return null;
  }
  return saved;
}
export function makeChoices(entry,pool,random=Math.random){const accepted=new Set(entry.translations.map(normalize));accepted.add(normalize(entry.meaning));const used=new Set(accepted);const wrong=[];for(const other of shuffle(pool,random)){const key=normalize(other.meaning);if(other.word===entry.word||used.has(key)||other.translations.some(x=>accepted.has(normalize(x))))continue;used.add(key);wrong.push({text:other.meaning,correct:false});if(wrong.length===3)break;}return shuffle([{text:entry.meaning,correct:true},...wrong],random);}
export function restoreProgress(raw){try{const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {};const clean={};for(const [id,r] of Object.entries(parsed)){if(!/^m[12]-[\w-]+$/.test(id))continue;if(!r||!Number.isSafeInteger(r.attempts)||r.attempts<0)continue;clean[id]={attempts:r.attempts,correct:Math.max(0,Math.min(r.attempts,Number(r.correct)||0)),assisted:Math.max(0,Math.min(r.attempts,Number(r.assisted)||0)),needsReview:r.needsReview===true};}return clean;}catch{return {};}}
export function recordAnswer(progress,id,correct,assisted){const r=progress[id]||{attempts:0,correct:0,assisted:0,needsReview:false};r.attempts++;if(assisted)r.assisted++;if(correct&&!assisted)r.correct++;r.needsReview=!correct||assisted;progress[id]=r;}
