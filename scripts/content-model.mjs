import defaults from '../client/src/content/defaults.json' with { type: 'json' };

export { defaults };
export const documentId = 'vorix-website';
export const documentType = 'websiteContent';
export const apiVersion = '2025-02-19';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const styles = {
  tone: ['saffron', 'rose', 'wine', 'cream', 'amber', 'sage'],
  visual: ['rings', 'petals', 'red-rings', 'cloves', 'crunch', 'spices'],
};
export function safeLink(value) {
  return typeof value === 'string' && (/^\/(?!\/)[^\\\s]*$/.test(value) || /^https:\/\/[^\s]+$/.test(value));
}
const safePath = value => typeof value === 'string' && ( /^\/(?!\/)[^"<>\\\r\n]*$/.test(value) || /^https:\/\/cdn\.sanity\.io\/images\/[a-z0-9]+\/[a-z0-9_-]+\/[a-zA-Z0-9.-]+(?:\?[^"<>\s]*)?$/.test(value));

/** Only known fields reach the frontend; missing fields retain the original site content. */
export function normalizeContent(document, config = {}) {
  function normalize(base, value, path = '') {
    if (value == null) return structuredClone(base);
    if (Array.isArray(base)) {
      if (!Array.isArray(value)) throw new Error(`Expected a list at ${path}`);
      if (['processSteps', 'pillars', 'navigation'].includes(path) && value.length !== base.length) throw new Error(`Keep ${base.length} items in ${path} to preserve the layout`);
      if (value.length === 0 && path !== 'faqs' && path !== 'journal') throw new Error(`${path} cannot be empty`);
      const result = value.map((entry, i) => normalize(base.find(b => b?._key && b._key === entry?._key) ?? base[i] ?? base[0], entry, `${path}.${i}`));
      if (result.some(object)) {
        const keys = result.filter(v => v._key).map(v => v._key);
        if (new Set(keys).size !== keys.length) throw new Error(`Duplicate item keys at ${path}`);
      }
      return result;
    }
    if (object(base)) {
      if (!object(value)) throw new Error(`Expected an object at ${path}`);
      if ('path' in base && 'alt' in base) {
        let source = value.path ?? base.path;
        const ref = value.upload?.asset?._ref;
        if (ref) {
          const match = /^image-([a-zA-Z0-9]+)-(\d+x\d+)-(jpg|jpeg|png|webp|gif|avif)$/.exec(ref);
          if (!match || !config.projectId || !config.dataset) throw new Error(`Invalid image at ${path}`);
          source = `https://cdn.sanity.io/images/${config.projectId}/${config.dataset}/${match[1]}-${match[2]}.${match[3]}?auto=format&fit=max&w=1920`;
          const crop = value.upload.crop;
          if (crop) {
            const {left=0, right=0, top=0, bottom=0} = crop;
            if (![left,right,top,bottom].every(n=>typeof n==='number' && Number.isFinite(n) && n>=0 && n<1) || left+right>=1 || top+bottom>=1) throw new Error(`Invalid image crop at ${path}`);
            const [width,height] = match[2].split('x').map(Number);
            const x=Math.round(left*width), y=Math.round(top*height);
            const w=Math.min(width-x,Math.max(1,Math.round((1-left-right)*width)));
            const h=Math.min(height-y,Math.max(1,Math.round((1-top-bottom)*height)));
            source += `&rect=${x},${y},${w},${h}`;
          }
        }
        if (!safePath(source)) throw new Error(`Invalid image URL at ${path}`);
        if (value.alt != null && typeof value.alt !== 'string') throw new Error(`Invalid image description at ${path}`);
        return {path: source, alt: value.alt ?? base.alt};
      }
      return Object.fromEntries(Object.entries(base).map(([key, fallback]) => [key, normalize(fallback, value[key], path ? `${path}.${key}` : key)]));
    }
    if (typeof value !== typeof base) throw new Error(`Invalid value at ${path}`);
    if (typeof value === 'string') {
      const key = path.split('.').at(-1);
      if (styles[key] && !styles[key].includes(value)) throw new Error(`Unknown design option at ${path}`);
      if (key === 'href' || key === 'instagramUrl') {
        if (!safeLink(value)) throw new Error(`Invalid link at ${path}`);
      }
      if (['domesticEmail','exportEmail'].includes(key) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error(`Invalid email at ${path}`);
      if (key === 'phone' && !/^\+?[\d\s().-]{5,30}$/.test(value)) throw new Error(`Invalid phone at ${path}`);
      if (key === '_key' && !/^[\w-]+$/.test(value)) throw new Error(`Invalid item key at ${path}`);
      if (value.length > 20000) throw new Error(`Text is too long at ${path}`);
    }
    return value;
  }
  return normalize(defaults, document);
}

/** Sanity requires stable keys for every object inside an array. */
export function seedDocument() {
  const addKeys = (value, prefix = 'item') => Array.isArray(value)
    ? value.map((item, index) => object(item) ? {...addKeys(item, `${prefix}-${index}`), _type: `${prefix}Item`, _key: item._key ?? `${prefix}-${index}`} : item)
    : object(value) ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, addKeys(child, key)])) : value;
  return {_id: documentId, _type: documentType, ...addKeys(defaults)};
}
