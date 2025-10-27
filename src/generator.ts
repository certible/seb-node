import type { SEBConfig } from './schema.js';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';
import { generatePlistXml } from './plist.js';
import { sebConfigSchema } from './schema.js';

const gzipAsync = promisify(gzip);

export interface SEBGenerateOptions {
  /**
   * Whether to encrypt the SEB file
   * @default false
   */
  encrypt?: boolean;

  /**
   * Password for encryption (required if encrypt is true)
   */
  password?: string;

  /**
   * Validate the configuration against the schema
   * @default true
   */
  validate?: boolean;
}

export interface SEBGenerateResult {
  /**
   * The binary SEB file data
   */
  data: Buffer;

  /**
   * The generated XML plist string
   */
  xml: string;

  /**
   * File size in bytes
   */
  size: number;
}

/**
 * Generate a SEB configuration file from a config object
 *
 * @param config - The SEB configuration object
 * @param options - Generation options
 * @returns The generated SEB file data and metadata
 *
 * @example
 * ```typescript
 * const result = await generateSEBConfig({
 *   startURL: 'https://exam.example.com',
 *   allowQuit: false,
 *   browserViewMode: 1,
 * });
 *
 * // Save to file
 * fs.writeFileSync('exam.seb', result.data);
 * ```
 */
export async function generateSEBConfig(
  config: Partial<SEBConfig>,
  options: SEBGenerateOptions = {},
): Promise<SEBGenerateResult> {
  const { encrypt = false, password, validate = true } = options;

  let validatedConfig: SEBConfig;
  if (validate) {
    validatedConfig = sebConfigSchema.parse(config);
  }
  else {
    validatedConfig = config as SEBConfig;
  }

  const plistXml = generatePlistXml(validatedConfig as unknown as Record<string, unknown>);

  let compressedData: Buffer;

  if (encrypt && password) {
    compressedData = await generateEncryptedSEB(plistXml, password);
  }
  else {
    // Unencrypted mode (plain)
    compressedData = await generatePlainSEB(plistXml);
  }

  return {
    data: compressedData,
    xml: plistXml,
    size: compressedData.length,
  };
}

/**
 * Generate an unencrypted (plain) SEB file
 *
 * @param plistXml - The XML plist string
 * @returns The compressed SEB file data
 */
export async function generatePlainSEB(plistXml: string): Promise<Buffer> {
  const xmlBuffer = Buffer.from(plistXml, 'utf8');
  const gzippedXml = await gzipAsync(xmlBuffer);

  // Add "plnd" prefix (plain data, unencrypted)
  const prefix = Buffer.from('plnd', 'utf8');
  const prefixedData = Buffer.concat([prefix, gzippedXml]);

  const compressedData = await gzipAsync(prefixedData);
  return compressedData;
}

/**
 * Generate an encrypted SEB file
 *
 * @param plistXml - The XML plist string
 * @param password - The password to use for encryption
 * @returns The compressed and encrypted SEB file data
 */
export async function generateEncryptedSEB(plistXml: string, password: string): Promise<Buffer> {
  const xmlBuffer = Buffer.from(plistXml, 'utf8');

  const gzippedXml = await gzipAsync(xmlBuffer);

  // Encrypt with AES-256
  // Generate key from password using PBKDF2
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(gzippedXml), cipher.final()]);

  // Add "pwcc" prefix (password encrypted)
  const prefix = Buffer.from('pwcc', 'utf8');
  const prefixedData = Buffer.concat([prefix, salt, iv, encrypted]);

  const compressedData = await gzipAsync(prefixedData);
  return compressedData;
}
