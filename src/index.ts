export {
  convertToSEBJSON,
  generateConfigKey,
  generateConfigKeyHash,
  removeURLFragment,
  verifyConfigKeyHash,
} from './config-key.js';
export type { SEBConfigObject } from './config-key.js';

export {
  generateEncryptedSEB,
  generatePlainSEB,
  generateSEBConfig,
} from './generator.js';
export type { SEBGenerateOptions, SEBGenerateResult } from './generator.js';

export {
  dictToXml,
  escapeXml,
  generatePlistXml,
  valueToXml,
} from './plist.js';

export { sebConfigSchema } from './schema.js';
export type {
  AdditionalResource,
  PermittedProcess,
  Process,
  SEBConfig,
  URLFilterRule,
} from './schema.js';
