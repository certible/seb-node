export { sebConfigSchema } from './schema.js';
export type {
  SEBConfig,
  URLFilterRule,
  AdditionalResource,
  Process,
  PermittedProcess,
} from './schema.js';

export {
  generateSEBConfig,
  generatePlainSEB,
  generateEncryptedSEB,
} from './generator.js';
export type { SEBGenerateOptions, SEBGenerateResult } from './generator.js';

export {
  generatePlistXml,
  escapeXml,
  valueToXml,
  dictToXml,
} from './plist.js';
