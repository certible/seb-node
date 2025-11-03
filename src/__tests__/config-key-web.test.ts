import { describe, expect, it, vi } from 'vitest';
import { generateConfigKeyHash, verifyConfigKeyHash } from '../config-key-web.js';
import { removeURLFragment } from '../config-key-shared.js';

// Mock Web Crypto API for Node.js test environment
const mockCrypto = {
  subtle: {
    digest: async (algorithm: string, data: Uint8Array) => {
      const crypto = await import('node:crypto');
      const hash = crypto.createHash('sha256');
      hash.update(data);
      return hash.digest();
    },
  },
};

// Setup global crypto mock
global.window = {
  crypto: mockCrypto,
} as any;

describe('config-key-web', () => {
  describe('removeURLFragment', () => {
    it('removes fragment from URL', () => {
      expect(removeURLFragment('https://example.com/path#fragment')).toBe('https://example.com/path');
    });

    it('handles URL without fragment', () => {
      expect(removeURLFragment('https://example.com/path')).toBe('https://example.com/path');
    });

    it('handles multiple # characters', () => {
      expect(removeURLFragment('https://example.com/path#fragment#more')).toBe('https://example.com/path');
    });
  });

  describe('generateConfigKeyHash', () => {
    it('generates correct hash for URL and config key', async () => {
      const url = 'https://exam.example.com/quiz/1';
      const configKey = 'abc123def456';
      
      const hash = await generateConfigKeyHash(url, configKey);
      
      // Hash should be a 64-character hex string
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      
      // Verify it's deterministic (same input produces same output)
      const hash2 = await generateConfigKeyHash(url, configKey);
      expect(hash).toBe(hash2);
    });

    it('removes fragment before hashing', async () => {
      const urlWithFragment = 'https://exam.example.com/quiz/1#section2';
      const urlWithoutFragment = 'https://exam.example.com/quiz/1';
      const configKey = 'abc123def456';
      
      const hash1 = await generateConfigKeyHash(urlWithFragment, configKey);
      const hash2 = await generateConfigKeyHash(urlWithoutFragment, configKey);
      
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different URLs', async () => {
      const configKey = 'abc123def456';
      
      const hash1 = await generateConfigKeyHash('https://example.com/page1', configKey);
      const hash2 = await generateConfigKeyHash('https://example.com/page2', configKey);
      
      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes for different config keys', async () => {
      const url = 'https://exam.example.com/quiz/1';
      
      const hash1 = await generateConfigKeyHash(url, 'key1');
      const hash2 = await generateConfigKeyHash(url, 'key2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyConfigKeyHash', () => {
    it('returns true for matching hash', async () => {
      const url = 'https://exam.example.com/quiz/1';
      const configKey = 'abc123def456';
      const hash = await generateConfigKeyHash(url, configKey);
      
      const isValid = await verifyConfigKeyHash(url, configKey, hash);
      
      expect(isValid).toBe(true);
    });

    it('returns false for non-matching hash', async () => {
      const url = 'https://exam.example.com/quiz/1';
      const configKey = 'abc123def456';
      const wrongHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      
      const isValid = await verifyConfigKeyHash(url, configKey, wrongHash);
      
      expect(isValid).toBe(false);
    });

    it('is case-insensitive', async () => {
      const url = 'https://exam.example.com/quiz/1';
      const configKey = 'abc123def456';
      const hash = await generateConfigKeyHash(url, configKey);
      const upperHash = hash.toUpperCase();
      
      const isValid = await verifyConfigKeyHash(url, configKey, upperHash);
      
      expect(isValid).toBe(true);
    });

    it('removes fragment before verification', async () => {
      const urlWithFragment = 'https://exam.example.com/quiz/1#section2';
      const urlWithoutFragment = 'https://exam.example.com/quiz/1';
      const configKey = 'abc123def456';
      const hash = await generateConfigKeyHash(urlWithoutFragment, configKey);
      
      const isValid = await verifyConfigKeyHash(urlWithFragment, configKey, hash);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Web Crypto API availability', () => {
    it('throws error when crypto is not available', async () => {
      const originalWindow = global.window;
      global.window = undefined as any;

      await expect(generateConfigKeyHash('https://example.com', 'key')).rejects.toThrow(
        'Web Crypto API is not available in this environment'
      );

      global.window = originalWindow;
    });
  });
});
