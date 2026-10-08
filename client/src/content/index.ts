import defaults from './defaults.json';
import snapshot from './generated.json';

// One build-time snapshot is shared by prerendering and hydration. No CMS secrets
// or runtime network dependency are shipped to website visitors.
export const content: typeof defaults = snapshot;
