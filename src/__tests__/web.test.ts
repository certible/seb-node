import { describe, expect, it } from 'vitest';

/* Test that web re-exports work correctly */
import {
  generateConfigKeyHash,
  getSEBKeys,
  isSEBAvailable,
  parseSEBVersion,
  removeURLFragment,
  verifyConfigKeyHash,
} from '../web.js';

describe('web exports', () => {
  it('should export browser API functions', () => {
    expect(typeof isSEBAvailable).toBe('function');
    expect(typeof getSEBKeys).toBe('function');
    expect(typeof parseSEBVersion).toBe('function');
  });

  it('should export config key verification functions', () => {
    expect(typeof generateConfigKeyHash).toBe('function');
    expect(typeof verifyConfigKeyHash).toBe('function');
    expect(typeof removeURLFragment).toBe('function');
  });

  it('should work with basic functionality', () => {
    // Test removeURLFragment
    const url = removeURLFragment('https://example.com/page#section');
    expect(url).toBe('https://example.com/page');

    // Test parseSEBVersion
    const version = parseSEBVersion('SEB_Windows_3.3.2_1234_org.safeexambrowser.SEB');
    expect(version?.os).toBe('Windows');
  });
});
