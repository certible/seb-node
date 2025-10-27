import { describe, expect, it } from 'vitest';
import {
  convertToSEBJSON,
  generateConfigKey,
  generateConfigKeyHash,
  removeURLFragment,
  verifyConfigKeyHash,
} from '../config-key.js';

describe('config-key', () => {
  describe('removeURLFragment', () => {
    it('should remove fragment from URL', () => {
      expect(removeURLFragment('https://example.com/page#section')).toBe('https://example.com/page');
      expect(removeURLFragment('https://example.com/page')).toBe('https://example.com/page');
      expect(removeURLFragment('https://example.com/#top')).toBe('https://example.com/');
    });

    it('should handle multiple # characters', () => {
      expect(removeURLFragment('https://example.com/page#section#subsection')).toBe('https://example.com/page');
    });

    it('should handle empty fragment', () => {
      expect(removeURLFragment('https://example.com/page#')).toBe('https://example.com/page');
    });
  });

  describe('convertToSEBJSON', () => {
    it('should remove originatorVersion key', () => {
      const config = {
        startURL: 'https://example.com',
        originatorVersion: '3.7.0',
        allowQuit: false,
      };
      const json = convertToSEBJSON(config);
      expect(json).not.toContain('originatorVersion');
      expect(json).toContain('startURL');
      expect(json).toContain('allowQuit');
    });

    it('should sort keys alphabetically (case insensitive)', () => {
      const config = {
        zulu: 'last',
        alpha: 'first',
        Beta: 'second',
        charlie: 'third',
      };
      const json = convertToSEBJSON(config);
      const firstAlpha = json.indexOf('"alpha"');
      const firstBeta = json.indexOf('"Beta"');
      const firstCharlie = json.indexOf('"charlie"');
      const firstZulu = json.indexOf('"zulu"');

      expect(firstAlpha).toBeLessThan(firstBeta);
      expect(firstBeta).toBeLessThan(firstCharlie);
      expect(firstCharlie).toBeLessThan(firstZulu);
    });

    it('should handle nested objects with sorted keys', () => {
      const config = {
        nested: {
          zeta: 3,
          alpha: 1,
          beta: 2,
        },
      };
      const json = convertToSEBJSON(config);
      expect(json).toBe('{"nested":{"alpha":1,"beta":2,"zeta":3}}');
    });

    it('should handle arrays', () => {
      const config = {
        items: [1, 2, 3],
        strings: ['a', 'b', 'c'],
      };
      const json = convertToSEBJSON(config);
      expect(json).toContain('"items":[1,2,3]');
      expect(json).toContain('"strings":["a","b","c"]');
    });

    it('should handle boolean values', () => {
      const config = {
        enabled: true,
        disabled: false,
      };
      const json = convertToSEBJSON(config);
      expect(json).toContain('"disabled":false');
      expect(json).toContain('"enabled":true');
    });

    it('should handle numbers', () => {
      const config = {
        count: 42,
        percentage: 0.5,
        negative: -10,
      };
      const json = convertToSEBJSON(config);
      expect(json).toContain('"count":42');
      expect(json).toContain('"percentage":0.5');
      expect(json).toContain('"negative":-10');
    });

    it('should handle strings with special characters', () => {
      const config = {
        url: 'https://example.com',
        path: '/path/to/file',
        quote: 'He said "hello"',
      };
      const json = convertToSEBJSON(config);
      expect(json).toContain('"url":"https://example.com"');
      expect(json).toContain('"path":"/path/to/file"');
      expect(json).toContain('"quote":"He said \\"hello\\""');
    });

    it('should handle Buffer as Base64', () => {
      const config = {
        data: Buffer.from('hello world', 'utf8'),
      };
      const json = convertToSEBJSON(config);
      const expectedBase64 = Buffer.from('hello world', 'utf8').toString('base64');
      expect(json).toContain(`"data":"${expectedBase64}"`);
    });

    it('should handle Date as ISO 8601', () => {
      const date = new Date('2023-01-15T10:30:00.000Z');
      const config = {
        timestamp: date,
      };
      const json = convertToSEBJSON(config);
      expect(json).toContain('"timestamp":"2023-01-15T10:30:00.000Z"');
    });

    it('should remove empty dictionaries', () => {
      const config = {
        valid: { key: 'value' },
        empty: {},
        alsoValid: 'test',
      };
      const json = convertToSEBJSON(config);
      expect(json).not.toContain('"empty"');
      expect(json).toContain('"valid"');
      expect(json).toContain('"alsoValid"');
    });

    it('should handle nested empty dictionaries', () => {
      const config = {
        outer: {
          inner: {},
          valid: 'value',
        },
      };
      const json = convertToSEBJSON(config);
      expect(json).not.toContain('"inner"');
      expect(json).toContain('"valid":"value"');
    });

    it('should not include whitespace', () => {
      const config = {
        key1: 'value1',
        key2: 'value2',
      };
      const json = convertToSEBJSON(config);
      expect(json).not.toMatch(/\s/);
    });

    it('should handle complex SEB config structure', () => {
      const config = {
        startURL: 'https://exam.example.com',
        allowQuit: false,
        browserViewMode: 1,
        urlFilterRules: [
          {
            active: true,
            expression: 'example.com',
            action: 1,
          },
        ],
        additionalResources: [],
      };
      const json = convertToSEBJSON(config);

      // Should be valid JSON structure (no whitespace)
      expect(json).not.toMatch(/\s/);

      // Should contain all keys
      expect(json).toContain('startURL');
      expect(json).toContain('allowQuit');
      expect(json).toContain('browserViewMode');
      expect(json).toContain('urlFilterRules');

      // Should be alphabetically sorted at root level
      const keys = ['additionalResources', 'allowQuit', 'browserViewMode', 'startURL', 'urlFilterRules'];
      let lastIndex = -1;
      for (const key of keys) {
        const index = json.indexOf(`"${key}"`);
        expect(index).toBeGreaterThan(lastIndex);
        lastIndex = index;
      }
    });

    it('should handle null and undefined', () => {
      const config = {
        nullValue: null,
        undefinedValue: undefined,
      };
      const json = convertToSEBJSON(config);
      expect(json).toContain('"nullValue":null');
      expect(json).toContain('"undefinedValue":null');
    });
  });

  describe('generateConfigKey', () => {
    it('should generate 64-character hex string', () => {
      const config = {
        startURL: 'https://example.com',
        allowQuit: false,
      };
      const key = generateConfigKey(config);

      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should be deterministic for same config', () => {
      const config = {
        startURL: 'https://example.com',
        allowQuit: false,
      };
      const key1 = generateConfigKey(config);
      const key2 = generateConfigKey(config);

      expect(key1).toBe(key2);
    });

    it('should differ for different configs', () => {
      const config1 = {
        startURL: 'https://example.com',
        allowQuit: false,
      };
      const config2 = {
        startURL: 'https://example.com',
        allowQuit: true,
      };
      const key1 = generateConfigKey(config1);
      const key2 = generateConfigKey(config2);

      expect(key1).not.toBe(key2);
    });

    it('should ignore originatorVersion in hash', () => {
      const config1 = {
        startURL: 'https://example.com',
        allowQuit: false,
        originatorVersion: '3.7.0',
      };
      const config2 = {
        startURL: 'https://example.com',
        allowQuit: false,
        originatorVersion: '3.8.0',
      };
      const key1 = generateConfigKey(config1);
      const key2 = generateConfigKey(config2);

      expect(key1).toBe(key2);
    });

    it('should be case-sensitive for values but not for key ordering', () => {
      const config1 = {
        startURL: 'https://Example.com',
      };
      const config2 = {
        startURL: 'https://example.com',
      };
      const key1 = generateConfigKey(config1);
      const key2 = generateConfigKey(config2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('generateConfigKeyHash', () => {
    it('should generate 64-character hex string', () => {
      const configKey = 'a'.repeat(64);
      const url = 'https://example.com/exam';
      const hash = generateConfigKeyHash(url, configKey);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should remove URL fragment before hashing', () => {
      const configKey = 'a'.repeat(64);
      const url1 = 'https://example.com/exam';
      const url2 = 'https://example.com/exam#section';

      const hash1 = generateConfigKeyHash(url1, configKey);
      const hash2 = generateConfigKeyHash(url2, configKey);

      expect(hash1).toBe(hash2);
    });

    it('should differ for different URLs', () => {
      const configKey = 'a'.repeat(64);
      const url1 = 'https://example.com/exam1';
      const url2 = 'https://example.com/exam2';

      const hash1 = generateConfigKeyHash(url1, configKey);
      const hash2 = generateConfigKeyHash(url2, configKey);

      expect(hash1).not.toBe(hash2);
    });

    it('should differ for different config keys', () => {
      const configKey1 = 'a'.repeat(64);
      const configKey2 = 'b'.repeat(64);
      const url = 'https://example.com/exam';

      const hash1 = generateConfigKeyHash(url, configKey1);
      const hash2 = generateConfigKeyHash(url, configKey2);

      expect(hash1).not.toBe(hash2);
    });

    it('should be deterministic', () => {
      const configKey = 'a'.repeat(64);
      const url = 'https://example.com/exam';

      const hash1 = generateConfigKeyHash(url, configKey);
      const hash2 = generateConfigKeyHash(url, configKey);

      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyConfigKeyHash', () => {
    it('should return true for matching hash', () => {
      const configKey = 'a'.repeat(64);
      const url = 'https://example.com/exam';
      const expectedHash = generateConfigKeyHash(url, configKey);

      const isValid = verifyConfigKeyHash(url, configKey, expectedHash);
      expect(isValid).toBe(true);
    });

    it('should return false for non-matching hash', () => {
      const configKey = 'a'.repeat(64);
      const url = 'https://example.com/exam';
      const wrongHash = 'b'.repeat(64);

      const isValid = verifyConfigKeyHash(url, configKey, wrongHash);
      expect(isValid).toBe(false);
    });

    it('should be case-insensitive for hash comparison', () => {
      const configKey = 'a'.repeat(64);
      const url = 'https://example.com/exam';
      const hash = generateConfigKeyHash(url, configKey);
      const upperHash = hash.toUpperCase();

      const isValid = verifyConfigKeyHash(url, configKey, upperHash);
      expect(isValid).toBe(true);
    });

    it('should handle URL fragments correctly', () => {
      const configKey = 'a'.repeat(64);
      const url = 'https://example.com/exam#section';
      const urlWithoutFragment = 'https://example.com/exam';
      const expectedHash = generateConfigKeyHash(urlWithoutFragment, configKey);

      const isValid = verifyConfigKeyHash(url, configKey, expectedHash);
      expect(isValid).toBe(true);
    });
  });

  describe('integration test', () => {
    it('should generate and verify config key for typical SEB config', () => {
      // Create a typical SEB configuration
      const config = {
        startURL: 'https://exam.university.edu/quiz/123',
        allowQuit: false,
        browserViewMode: 1,
        enableURLFilter: true,
        urlFilterRules: [
          {
            active: true,
            expression: 'university.edu',
            action: 1,
          },
        ],
        sendBrowserExamKey: true,
        browserURLSalt: true,
        allowAudioCapture: false,
        allowVideoCapture: false,
        allowSpellCheck: false,
        showTaskBar: true,
        browserWindowAllowReload: true,
      };

      // Generate Config Key
      const configKey = generateConfigKey(config);
      expect(configKey).toHaveLength(64);

      // Simulate server-side verification
      const requestURL = 'https://exam.university.edu/quiz/123/question/5';
      const configKeyHash = generateConfigKeyHash(requestURL, configKey);

      // Verify the hash (as the server would)
      const isValid = verifyConfigKeyHash(requestURL, configKey, configKeyHash);
      expect(isValid).toBe(true);

      // Verify with wrong URL should fail
      const wrongURL = 'https://malicious.com/fake';
      const isValidWrong = verifyConfigKeyHash(wrongURL, configKey, configKeyHash);
      expect(isValidWrong).toBe(false);
    });
  });
});
