import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {defaults, normalizeContent, seedDocument} from './content-model.mjs';

test('the original content survives missing CMS fields and initial seeding',()=>{
  assert.deepEqual(normalizeContent(null),defaults);
  assert.deepEqual(normalizeContent({}),defaults);
  assert.deepEqual(normalizeContent(seedDocument()),defaults);
});
test('partial edits keep surrounding content and renamed products keep their images',()=>{
  const draft=seedDocument();
  draft.copy.hero.headingQualityLikeNeverBefore='Edited headline';
  draft.productDepth[0].items[0].name='New product name';
  const result=normalizeContent(draft);
  assert.equal(result.copy.hero.headingQualityLikeNeverBefore,'Edited headline');
  assert.deepEqual(result.heroImage,defaults.heroImage);
  assert.deepEqual(result.productDepth[0].items[0].image,defaults.productDepth[0].items[0].image);
  assert.deepEqual(result.copy.about,defaults.copy.about);
});
test('CMS uploads replace only the selected image; removing one restores the original',()=>{
  const draft=seedDocument();
  draft.heroImage.upload={asset:{_ref:'image-abc123-1600x900-webp'}};
  const result=normalizeContent(draft,{projectId:'test123',dataset:'production'});
  assert.match(result.heroImage.path,/^https:\/\/cdn\.sanity\.io\/images\/test123\/production\/abc123-1600x900.webp/);
  assert.deepEqual(result.categories,defaults.categories);
  delete draft.heroImage.upload;
  assert.deepEqual(normalizeContent(draft).heroImage,defaults.heroImage);
});
test('empty optional sections are allowed, broken product and process lists are blocked',()=>{
  assert.deepEqual(normalizeContent({faqs:[],journal:[]}).faqs,[]);
  for(const update of [{productDepth:[]},{categories:[]},{processSteps:[]},{pillars:[]},{navigation:[]}]) assert.throws(()=>normalizeContent(update));
});
test('malformed content, unsafe URLs and unknown design options cannot reach a build',()=>{
  for(const update of [
    {contact:{instagramUrl:'javascript:alert(1)'}},
    {navigation:[{href:'//example.com'},{href:'/about'},{href:'/products'}]},
    {heroImage:{path:'javascript:alert(1)'}},
    {heroImage:{upload:{asset:{_ref:'not-an-image'}}}},
    {categories:[{tone:'missing-style'}]},
    {contact:{domesticEmail:'invalid',phone:'bad'}},
    {copy:{hero:[]}},
  ]) assert.throws(()=>normalizeContent(update,{projectId:'test123',dataset:'production'}));
});
test('category and format lists can be added to and reordered using stable keys',()=>{
  const draft=seedDocument();
  draft.categories.reverse();
  draft.categories.push({...draft.categories[0],_key:'new-category',name:'New ingredient'});
  assert.equal(normalizeContent(draft).categories.at(-1).name,'New ingredient');
  draft.categories.push({...draft.categories[0]});
  assert.throws(()=>normalizeContent(draft),/Duplicate/);
});
test('every original content image still exists on disk',()=>{
  let count=0;
  function walk(value) {
    if(value && typeof value==='object') {
      if(typeof value.path==='string') {
        assert.ok(fs.existsSync(path.join(import.meta.dirname,'../client/public',value.path)),value.path);
        count++;
      }
      Object.values(value).forEach(walk);
    }
  }
  walk(defaults);
  assert.ok(count>30);
});

test('seeded array objects have Studio-compatible types and keys',()=>{
  const seed=seedDocument();
  assert.equal(seed.categories[0]._type,'categoriesItem');
  assert.equal(seed.productDepth[0].items[0]._type,'itemsItem');
  assert.ok(seed.navigation.every(item=>item._key && item._type==='navigationItem'));
});

test('image crop coordinates are converted to the image CDN rectangle',()=>{
  const image={upload:{asset:{_ref:'image-abc123-1600x900-webp'},crop:{left:.1,right:.1,top:0,bottom:0}}};
  assert.match(normalizeContent({heroImage:image},{projectId:'test123',dataset:'production'}).heroImage.path,/rect=160,0,1280,900$/);
});

test('real sync entrypoint loads published edits and preserves the snapshot on API failures',()=>{
  const snapshot=path.resolve(import.meta.dirname,'../client/src/content/generated.json');
  const previous=fs.existsSync(snapshot)?fs.readFileSync(snapshot):null;
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'vorix-cms-test-'));
  try {
    const draft=seedDocument();
    draft.copy.hero.headingQualityLikeNeverBefore='A published edit';
    draft.seo.home.title='Edited page title';
    draft.faqs[0].answer='Edited answer';
    const fixture=path.join(temporary,'fixture.json');
    fs.writeFileSync(fixture,JSON.stringify(draft));
    const mock=path.join(temporary,'mock.mjs');
    fs.writeFileSync(mock,`import fs from 'node:fs';
globalThis.fetch=async input=>{
 const url=new URL(input);
 if(url.hostname!=='test123.api.sanity.io'||url.searchParams.get('perspective')!=='published'||!url.searchParams.get('query').includes('vorix-website')) throw new Error('Unexpected CMS request');
 const mode=process.env.CMS_TEST_MODE;
 if(mode==='error') return new Response('{}',{status:503});
 return new Response(JSON.stringify({result:mode==='missing'?null:JSON.parse(fs.readFileSync(process.env.CMS_TEST_FIXTURE,'utf8'))}));
};`);
    const run=mode=>spawnSync(process.execPath,['--import',pathToFileURL(mock).href,path.join(import.meta.dirname,'sync-content.mjs')],{
      env:{...process.env,SANITY_PROJECT_ID:'test123',SANITY_DATASET:'production',CMS_TEST_FIXTURE:fixture,CMS_TEST_MODE:mode},encoding:'utf8',timeout:45000,
    });
    const success=run('success');
    assert.equal(success.status,0,success.stderr);
    const content=JSON.parse(fs.readFileSync(snapshot,'utf8'));
    assert.equal(content.copy.hero.headingQualityLikeNeverBefore,'A published edit');
    assert.equal(content.seo.home.title,'Edited page title');
    assert.equal(content.faqs[0].answer,'Edited answer');
    assert.equal(content._id,undefined);
    const good=fs.readFileSync(snapshot,'utf8');
    for(const mode of ['error','missing']) {
      assert.notEqual(run(mode).status,0);
      assert.equal(fs.readFileSync(snapshot,'utf8'),good);
    }
  } finally {
    if(previous) fs.writeFileSync(snapshot,previous);
    else if(fs.existsSync(snapshot)) fs.unlinkSync(snapshot);
    for(const file of ['fixture.json','mock.mjs']) {
      const target=path.join(temporary,file);
      if(fs.existsSync(target)) fs.unlinkSync(target);
    }
    fs.rmdirSync(temporary);
  }
});
