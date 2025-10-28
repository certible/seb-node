/* eslint-disable no-restricted-globals, vars-on-top */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSEBKeys,
  isSEBAvailable,
  parseSEBVersion,
} from '../browser.js';

declare global {
  var window: Window & typeof globalThis;
}

describe('browser', () => {
  beforeEach(() => {
    /* Reset window.SafeExamBrowser before each test */
    if (typeof global.window !== 'undefined') {
      delete (global.window as any).SafeExamBrowser;
    }
  });

  describe('isSEBAvailable', () => {
    it('should return false when window is not defined', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(isSEBAvailable()).toBe(false);

      // Restore
      (global as any).window = originalWindow;
    });

    it('should return false when SafeExamBrowser is not defined', () => {
      global.window = {
        SafeExamBrowser: undefined,
      } as any;

      expect(isSEBAvailable()).toBe(false);
    });

    it('should return true when SafeExamBrowser is defined', () => {
      global.window = {
        SafeExamBrowser: {
          security: {},
        },
      } as any;

      expect(isSEBAvailable()).toBe(true);
    });
  });

  describe('getSEBKeys', () => {
    it('should return keys when available', () => {
      global.window = {
        SafeExamBrowser: {
          security: {
            browserExamKey: 'bek123',
            configKey: 'ck456',
          },
          version: 'SEB_Windows_3.3.2_1234_org.safeexambrowser.SEB',
        },
      } as any;

      const keys = getSEBKeys();
      expect(keys).toEqual({
        browserExamKey: 'bek123',
        configKey: 'ck456',
        version: 'SEB_Windows_3.3.2_1234_org.safeexambrowser.SEB',
        isAvailable: true,
      });
    });

    it('should return null values when keys are not set', () => {
      global.window = {
        SafeExamBrowser: {
          security: {},
          version: 'SEB_macOS_3.1_1000_org.safeexambrowser.SEB',
        },
      } as any;

      const keys = getSEBKeys();
      expect(keys).toEqual({
        browserExamKey: null,
        configKey: null,
        version: 'SEB_macOS_3.1_1000_org.safeexambrowser.SEB',
        isAvailable: true,
      });
    });
  });

  describe('getSEBKeys - not available', () => {
    it('should return null values when SEB is not available', () => {
      delete (global as any).window;

      const keys = getSEBKeys();
      expect(keys).toEqual({
        browserExamKey: null,
        configKey: null,
        version: null,
        isAvailable: false,
      });
    });
  });

  describe('parseSEBVersion', () => {
    it('should parse Windows version string', () => {
      const result = parseSEBVersion('SEB_Windows_3.3.2_1234_org.safeexambrowser.SEB');
      expect(result).toEqual({
        appName: 'SEB',
        os: 'Windows',
        version: '3.3.2',
        build: '1234',
        bundleId: 'org.safeexambrowser.SEB',
      });
    });

    it('should parse macOS version string', () => {
      const result = parseSEBVersion('SafeExamBrowser_macOS_3.1.0_900_org.safeexambrowser.SafeExamBrowser');
      expect(result).toEqual({
        appName: 'SafeExamBrowser',
        os: 'macOS',
        version: '3.1.0',
        build: '900',
        bundleId: 'org.safeexambrowser.SafeExamBrowser',
      });
    });

    it('should parse iOS version string', () => {
      const result = parseSEBVersion('SEB_iOS_3.0_500_org.safeexambrowser.SEB-iOS');
      expect(result).toEqual({
        appName: 'SEB',
        os: 'iOS',
        version: '3.0',
        build: '500',
        bundleId: 'org.safeexambrowser.SEB-iOS',
      });
    });

    it('should return null for invalid version string', () => {
      expect(parseSEBVersion('invalid')).toBe(null);
      expect(parseSEBVersion('SEB_Windows')).toBe(null);
      expect(parseSEBVersion('SEB_Windows_3.3.2')).toBe(null);
      expect(parseSEBVersion('')).toBe(null);
    });

    it('should return null for unknown OS', () => {
      const result = parseSEBVersion('SEB_Linux_1.0_100_org.safeexambrowser.SEB');
      expect(result).toBe(null);
    });

    it('should handle version strings with underscores in bundle ID', () => {
      const result = parseSEBVersion('SEB_Windows_3.3.2_1234_org.safe_exam_browser.SEB');
      expect(result).toEqual({
        appName: 'SEB',
        os: 'Windows',
        version: '3.3.2',
        build: '1234',
        bundleId: 'org.safe_exam_browser.SEB',
      });
    });
  });

  describe('integration test', () => {
    it('should work in a complete SEB environment simulation', () => {
      global.window = {
        SafeExamBrowser: {
          security: {
            browserExamKey: 'abc123def456',
            configKey: '789ghi012jkl',
          },
          version: 'SEB_Windows_3.3.2_1234_org.safeexambrowser.SEB',
        },
      } as any;

      expect(isSEBAvailable()).toBe(true);

      const keys = getSEBKeys();
      expect(keys.isAvailable).toBe(true);
      expect(keys.browserExamKey).toBe('abc123def456');
      expect(keys.configKey).toBe('789ghi012jkl');

      const versionInfo = parseSEBVersion(keys.version!);
      expect(versionInfo?.os).toBe('Windows');
      expect(versionInfo?.version).toBe('3.3.2');
    });
  });
});
