/**
 * Browser-side Safe Exam Browser JavaScript API helpers
 * @see https://safeexambrowser.org/developer/seb-config-key.html
 *
 */

export interface SafeExamBrowser {
  security: {
    /**
     * Browser Exam Key (BEK) - hashed with the current URL
     */
    browserExamKey?: string;

    /**
     * Config Key (CK) - hashed with the current URL
     */
    configKey?: string;
  };

  /**
   * SEB version information
   * Format: appDisplayName_<OS>_versionString_buildNumber_bundleID
   * OS can be: iOS, macOS, or Windows
   */
  version?: string;
}

declare global {
  interface Window {
    SafeExamBrowser?: SafeExamBrowser;
  }
}

export interface SEBKeys {
  /**
   * Browser Exam Key (BEK) hashed with current URL
   */
  browserExamKey: string | null;

  /**
   * Config Key (CK) hashed with current URL
   */
  configKey: string | null;

  /**
   * SEB version information
   */
  version: string | null;

  /**
   * Whether SEB JavaScript API is available
   */
  isAvailable: boolean;
}

/**
 * Checks if the SEB JavaScript API is available
 *
 * @returns true if running inside SEB with JS API support
 */
export function isSEBAvailable(): boolean {
  return typeof window !== 'undefined'
    && typeof window.SafeExamBrowser !== 'undefined';
}

/**
 * Gets the SEB keys (BEK and CK) from the JavaScript API
 */
export function getSEBKeys(): SEBKeys {
  if (!isSEBAvailable()) {
    return {
      browserExamKey: null,
      configKey: null,
      version: null,
      isAvailable: false,
    };
  }
  const seb = window.SafeExamBrowser!;
  return {
    browserExamKey: seb.security?.browserExamKey || null,
    configKey: seb.security?.configKey || null,
    version: seb.version || null,
    isAvailable: isSEBAvailable(),
  };
}

/**
 * Parses the SEB version string into components
 *
 * @param versionString - The SEB version string
 * @returns Parsed version information or null if invalid
 *
 * @example
 * ```typescript
 * const info = parseSEBVersion('SEB_Windows_3.3.2_1234_org.safeexambrowser.SEB');
 * // {
 * //   appName: 'SEB',
 * //   os: 'Windows',
 * //   version: '3.3.2',
 * //   build: '1234',
 * //   bundleId: 'org.safeexambrowser.SEB'
 * // }
 * ```
 */
export function parseSEBVersion(versionString: string): {
  appName: string;
  os: 'iOS' | 'macOS' | 'Windows';
  version: string;
  build: string;
  bundleId: string;
} | null {
  const parts = versionString.split('_');
  if (parts.length < 5) {
    return null;
  }

  const os = parts[1];
  if (os !== 'iOS' && os !== 'macOS' && os !== 'Windows') {
    return null;
  }

  const bundleId = parts.slice(4).join('_');

  return {
    appName: parts[0],
    os: os as 'iOS' | 'macOS' | 'Windows',
    version: parts[2],
    build: parts[3],
    bundleId,
  };
}
