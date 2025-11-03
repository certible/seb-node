/**
 * Browser-compatible Config Key verification for Safe Exam Browser
 * Uses Web Crypto API instead of Node.js crypto
 * @see https://safeexambrowser.org/developer/seb-config-key.html
 */

import { removeURLFragment } from './config-key-shared.js';

/**
 * Creates SHA-256 hash using Web Crypto API
 */
async function sha256(message: string): Promise<string> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this environment');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toLowerCase();
}

/**
 * Generates the Config Key hash for a URL request (async version for browser)
 * This is what SEB sends in the X-SafeExamBrowser-ConfigKeyHash header
 *
 * @param url - The absolute URL (without fragment)
 * @param configKey - The base Config Key (64-char hex string)
 * @returns The URL-specific Config Key hash (64-char hex string)
 *
 * @example
 * ```typescript
 * const urlHash = await generateConfigKeyHash('https://exam.example.com/quiz/1', configKey);
 * // Compare this with the X-SafeExamBrowser-ConfigKeyHash header value
 * ```
 */
export async function generateConfigKeyHash(url: string, configKey: string): Promise<string> {
  const urlWithoutFragment = removeURLFragment(url);
  const combined = urlWithoutFragment + configKey;
  return sha256(combined);
}

/**
 * Verifies that a Config Key hash matches the expected value for a given URL (async version for browser)
 *
 * @param url - The absolute URL (without fragment)
 * @param configKey - The base Config Key (64-char hex string)
 * @param receivedHash - The hash received in X-SafeExamBrowser-ConfigKeyHash header
 * @returns true if the hash matches, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await verifyConfigKeyHash(
 *   'https://exam.example.com/quiz/1',
 *   configKey,
 *   request.headers['x-safeexambrowser-configkeyhash']
 * );
 * if (!isValid) {
 *   throw new Error('Invalid SEB configuration');
 * }
 * ```
 */
export async function verifyConfigKeyHash(url: string, configKey: string, receivedHash: string): Promise<boolean> {
  const expectedHash = await generateConfigKeyHash(url, configKey);
  return expectedHash.toLowerCase() === receivedHash.toLowerCase();
}
