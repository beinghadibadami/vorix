import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {websiteContent} from './schema';
import {seedDocument} from '../scripts/content-model.mjs';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
if (!projectId) throw new Error('Set SANITY_STUDIO_PROJECT_ID in studio/.env.local. See CMS-SETUP.md.');
const {_id, _type, ...initialValue} = seedDocument();

export default defineConfig({
  name:'vorix',title:'Vorix Content Studio',projectId,dataset,
  plugins:[structureTool({structure:S=>S.list().title('Website content').items([
    S.listItem().id('vorix-website').title('Edit Vorix website').child(
      S.document().schemaType('websiteContent').documentId('vorix-website').title('Vorix website'),
    ),
  ])})],
  schema:{types:[{...websiteContent,initialValue}],templates:templates=>templates.filter(t=>t.schemaType!=='websiteContent')},
  document:{
    newDocumentOptions:()=>[],
    actions:actions=>actions.filter(action=>!['delete','duplicate','unpublish'].includes(action.action ?? '')),
  },
});
