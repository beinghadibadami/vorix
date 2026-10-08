import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadEnv} from 'vite';
import {defaults, normalizeContent, documentId, documentType, apiVersion} from './content-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv.includes('--development') ? 'development' : 'production';
const env = {...loadEnv(mode, root, ''), ...process.env};
const projectId = env.SANITY_PROJECT_ID;
const dataset = env.SANITY_DATASET || 'production';
let content = defaults;

if (projectId) {
  if (!/^[a-z0-9]+$/.test(projectId) || !/^[a-z0-9_-]+$/.test(dataset)) throw new Error('Invalid SANITY_PROJECT_ID or SANITY_DATASET');
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set('query', `*[_id == "${documentId}" && _type == "${documentType}"][0]`);
  url.searchParams.set('perspective', 'published');
  const headers = env.SANITY_READ_TOKEN ? {Authorization: `Bearer ${env.SANITY_READ_TOKEN}`} : {};
  // Fail the deployment on a configured CMS outage: Vercel keeps the last successful site live.
  const response = await fetch(url, {headers, signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Sanity content fetch failed (HTTP ${response.status}). Previous deployment remains unchanged.`);
  const payload = await response.json();
  if (payload.error || !Object.hasOwn(payload, 'result')) throw new Error('Unexpected Sanity query response');
  if (!payload.result) throw new Error('Sanity is connected but the published website document is missing. Run the Studio seed command before deploying.');
  content = normalizeContent(payload.result, {projectId, dataset});
  console.log('Loaded published Sanity content.');
} else {
  console.log('Sanity is not connected yet; preserving the original website content.');
}

const target = path.join(root, 'client/src/content/generated.json');
await fs.mkdir(path.dirname(target), {recursive:true});
await fs.writeFile(`${target}.tmp`, `${JSON.stringify(content, null, 2)}\n`);
await fs.rename(`${target}.tmp`, target);
