const {chromium}=require('C:/Users/GenaComp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=process.env.VOCABULARY_QA_OUTPUT||path.join(require('node:os').tmpdir(),'spotlight-pocket-qa');
(async()=>{
  await fs.mkdir(output,{recursive:true});
  const data=JSON.parse(await fs.readFile('dist/data.json','utf8'));
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  try{
    const context=await browser.newContext({isMobile:true,hasTouch:true});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4180');
    await page.getByRole('heading',{name:'A few words. Every day.'}).waitFor();
    const entry=data.entries.find(e=>e.word==='caring')||data.entries[0];
    const longChoices=[{text:entry.meaning,correct:true},...data.entries.filter(e=>e.id!==entry.id).sort((a,b)=>b.meaning.length-a.meaning.length).slice(0,3).map(e=>({text:e.meaning,correct:false}))];
    for(const viewport of [{width:393,height:700},{width:360,height:640},{width:393,height:600}]){
      await page.setViewportSize(viewport);
      for(const mode of ['recognition','listening','spelling'])for(const correct of [true,false]){
        const saved={ids:[entry.id],position:0,mode,choices:[longChoices],responses:{0:{answer:mode==='spelling'?(correct?entry.answers[0]:'incorrect'):(correct?'0':'1'),checked:true,correct,assisted:false,recorded:true,revealed:false}}};
        await page.evaluate(s=>localStorage.setItem('sp-session',JSON.stringify(s)),saved);
        await page.reload();await page.getByRole('button',{name:'See results',exact:true}).waitFor();
        await page.screenshot({path:path.join(output,`fit-${viewport.width}-${viewport.height}-${mode}-${correct?'correct':'wrong'}.png`),animations:'disabled'});
        const bounds=await page.getByRole('button',{name:'See results',exact:true}).boundingBox();
        assert(bounds.y>=0&&bounds.y+bounds.height<=viewport.height,`${mode} next button outside ${viewport.width}x${viewport.height}: ${JSON.stringify(bounds)}`);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
        assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'page requires vertical scrolling');
        await page.getByRole('button',{name:'See results',exact:true}).click();await page.getByRole('heading',{name:'Session complete.'}).waitFor();
      }
      console.log(`Visible next button, long choices and result navigation ${viewport.width}x${viewport.height}: PASS`);
    }
    for(const entry of [data.entries.reduce((a,b)=>a.word.length>b.word.length?a:b),data.entries.reduce((a,b)=>a.meaning.length>b.meaning.length?a:b)]){
      for(const mode of ['recognition','spelling']){
        const saved={ids:[entry.id],position:0,mode,choices:[[{text:entry.meaning,correct:true}]],responses:{0:{answer:mode==='spelling'?entry.answers[0]:'0',checked:true,correct:true,assisted:false,recorded:true,revealed:false}}};
        await page.evaluate(s=>localStorage.setItem('sp-session',JSON.stringify(s)),saved);await page.reload();
        await page.getByRole('button',{name:'See results',exact:true}).waitFor();
        for(const height of [700,600]){
          await page.setViewportSize({width:393,height});
          const bounds=await page.getByRole('button',{name:'See results',exact:true}).boundingBox();
          assert(bounds.y+bounds.height<=height,`Long phrase overflows ${height}: ${entry.word}`);
        }
      }
    }
    console.log('Longest phrases and live viewport resize: PASS');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
