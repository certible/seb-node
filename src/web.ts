/**
 * Import from '@certible/seb-config/web' in browser/client-side code
 */
export {
  getSEBKeys,
  isSEBAvailable,
  parseSEBVersion,
} from './browser.js';
export type { SafeExamBrowser, SEBKeys } from './browser.js';

export {
  removeURLFragment,
} from './config-key-shared.js';

export {
  generateConfigKeyHash,
  verifyConfigKeyHash,
} from './config-key-web.js';
