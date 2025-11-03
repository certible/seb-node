/**
 * Config Key generation and verification for Safe Exam Browser
 * @see https://safeexambrowser.org/developer/seb-config-key.html
 */

import { createHash } from 'node:crypto';
import { removeURLFragment } from './config-key-shared.js';

export interface SEBConfigObject {
  [key: string]: unknown;
}

/**
 * Converts a SEB plist object to SEB-JSON format (sorted, no whitespace, proper encoding)
 * @see https://safeexambrowser.org/developer/seb-config-key.html
 * @returns SEB-JSON string ready for hashing
 */
export function convertToSEBJSON(config: SEBConfigObject): string {
  const configCopy = { ...config };
  delete configCopy.originatorVersion;
  return stringifySEBJSON(configCopy);
}

function stringifySEBJSON(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    // No escaping according to spec, but we need to escape quotes and control chars for valid JSON
    return JSON.stringify(value);
  }

  if (value instanceof Date) {
    // ISO 8601 format
    return JSON.stringify(value.toISOString());
  }

  if (Buffer.isBuffer(value)) {
    // Convert to Base64
    return JSON.stringify(value.toString('base64'));
  }

  if (Array.isArray(value)) {
    const items = value.map(item => stringifySEBJSON(item));
    return `[${items.join(',')}]`;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // Remove empty dictionaries
    const nonEmptyKeys = Object.keys(obj).filter((key) => {
      const val = obj[key];
      if (typeof val === 'object' && val !== null && !Array.isArray(val) && !Buffer.isBuffer(val) && !(val instanceof Date)) {
        return Object.keys(val as Record<string, unknown>).length > 0;
      }
      return true;
    });

    if (nonEmptyKeys.length === 0) {
      return '{}';
    }

    // Sort keys alphabetically
    const sortedKeys = nonEmptyKeys.sort((a, b) => {
      return a.toLowerCase().localeCompare(b.toLowerCase(), 'en', { sensitivity: 'base' });
    });

    const pairs = sortedKeys.map((key) => {
      const keyStr = JSON.stringify(key);
      const valueStr = stringifySEBJSON(obj[key]);
      return `${keyStr}:${valueStr}`;
    });

    return `{${pairs.join(',')}}`;
  }

  return 'null';
}

/**
 * Generates the Config Key hash from a SEB configuration
 *
 * Steps:
 * 1. Convert config to SEB-JSON format
 * 2. Generate SHA256 hash
 * 3. Encode as Base16 (hex) lowercase
 *
 * @returns The Config Key as a 64-character hex string
 *
 * @example
 * ```typescript
 * const configKey = generateConfigKey({
 *   startURL: 'https://exam.example.com',
 *   allowQuit: false,
 *   browserViewMode: 1,
 * });
 * console.log(configKey); // e.g., "81aad4ab9dfd447cc479e6a4a7c9a544e2cafc7f3adeb68b2a21efad68eca4dc"
 * ```
 */
export function generateConfigKey(config: SEBConfigObject): string {
  const sebJSON = convertToSEBJSON(config);
  const hash = createHash('sha256').update(sebJSON, 'utf8').digest('hex');
  return hash.toLowerCase();
}

/**
 * Generates the Config Key hash for a URL request
 * This is what SEB sends in the X-SafeExamBrowser-ConfigKeyHash header
 *
 * @param url - The absolute URL (without fragment)
 * @param configKey - The base Config Key (64-char hex string)
 * @returns The URL-specific Config Key hash (64-char hex string)
 *
 * @example
 * ```typescript
 * const configKey = generateConfigKey(config);
 * const urlHash = generateConfigKeyHash('https://exam.example.com/quiz/1', configKey);
 * // Compare this with the X-SafeExamBrowser-ConfigKeyHash header value
 * ```
 */
export function generateConfigKeyHash(url: string, configKey: string): string {
  const urlWithoutFragment = removeURLFragment(url);
  const combined = urlWithoutFragment + configKey;
  const hash = createHash('sha256').update(combined, 'utf8').digest('hex');
  return hash.toLowerCase();
}

/**
 * Verifies that a Config Key hash matches the expected value for a given URL
 *
 * @param url - The absolute URL (without fragment)
 * @param configKey - The base Config Key (64-char hex string)
 * @param receivedHash - The hash received in X-SafeExamBrowser-ConfigKeyHash header
 * @returns true if the hash matches, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = verifyConfigKeyHash(
 *   'https://exam.example.com/quiz/1',
 *   configKey,
 *   request.headers['x-safeexambrowser-configkeyhash']
 * );
 * if (!isValid) {
 *   throw new Error('Invalid SEB configuration');
 * }
 * ```
 */
export function verifyConfigKeyHash(url: string, configKey: string, receivedHash: string): boolean {
  const expectedHash = generateConfigKeyHash(url, configKey);
  return expectedHash.toLowerCase() === receivedHash.toLowerCase();
}
