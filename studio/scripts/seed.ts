import {getCliClient} from 'sanity/cli';
import {seedDocument} from '../../scripts/content-model.mjs';

async function seed() {
  const client=getCliClient({apiVersion:'2025-02-19'});
  const document=seedDocument();
  const existing=await client.getDocument(document._id);
  if(existing) {
    console.log('Vorix content already exists. Nothing was overwritten.');
    return;
  }
  const draft=await client.getDocument(`drafts.${document._id}`);
  if(draft) throw new Error('An unpublished website draft exists. Publish it from Studio instead of seeding over it.');
  await client.createIfNotExists(document);
  console.log('Imported the existing website text and original image paths. Open Studio to edit.');
}
seed().catch(error=>{console.error(error);process.exitCode=1;});
