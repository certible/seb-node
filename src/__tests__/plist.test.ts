import { describe, it, expect } from 'vitest';
import { generatePlistXml, escapeXml, valueToXml, dictToXml } from '../plist.js';

describe('Plist Utilities', () => {
  describe('escapeXml', () => {
    it('should escape special XML characters', () => {
      expect(escapeXml('a & b')).toBe('a &amp; b');
      expect(escapeXml('a < b')).toBe('a &lt; b');
      expect(escapeXml('a > b')).toBe('a &gt; b');
      expect(escapeXml('a "quote"')).toBe('a &quot;quote&quot;');
      expect(escapeXml("a 'quote'")).toBe('a &apos;quote&apos;');
    });

    it('should handle strings with multiple special characters', () => {
      expect(escapeXml('<tag attr="value">')).toBe('&lt;tag attr=&quot;value&quot;&gt;');
    });
  });

  describe('valueToXml', () => {
    it('should convert boolean values', () => {
      expect(valueToXml(true)).toBe('<true/>');
      expect(valueToXml(false)).toBe('<false/>');
    });

    it('should convert integer values', () => {
      expect(valueToXml(42)).toBe('<integer>42</integer>');
      expect(valueToXml(0)).toBe('<integer>0</integer>');
      expect(valueToXml(-10)).toBe('<integer>-10</integer>');
    });

    it('should convert real (float) values', () => {
      expect(valueToXml(3.14)).toBe('<real>3.14</real>');
      expect(valueToXml(0.5)).toBe('<real>0.5</real>');
    });

    it('should convert string values', () => {
      expect(valueToXml('hello')).toBe('<string>hello</string>');
      expect(valueToXml('')).toBe('<string></string>');
    });

    it('should convert Buffer to base64 data', () => {
      const buffer = Buffer.from('test');
      const result = valueToXml(buffer);
      expect(result).toContain('<data>');
      expect(result).toContain('dGVzdA=='); // base64 of "test"
    });

    it('should convert empty arrays', () => {
      expect(valueToXml([])).toBe('<array/>');
    });

    it('should convert arrays with values', () => {
      const result = valueToXml(['a', 'b', 'c']);
      expect(result).toContain('<array>');
      expect(result).toContain('<string>a</string>');
      expect(result).toContain('<string>b</string>');
      expect(result).toContain('<string>c</string>');
      expect(result).toContain('</array>');
    });

    it('should handle null and undefined', () => {
      expect(valueToXml(null)).toBe('<string></string>');
      expect(valueToXml(undefined)).toBe('<string></string>');
    });
  });

  describe('dictToXml', () => {
    it('should convert simple dictionary', () => {
      const dict = { name: 'test', value: 42 };
      const result = dictToXml(dict);
      
      expect(result).toContain('<dict>');
      expect(result).toContain('<key>name</key>');
      expect(result).toContain('<string>test</string>');
      expect(result).toContain('<key>value</key>');
      expect(result).toContain('<integer>42</integer>');
      expect(result).toContain('</dict>');
    });

    it('should sort keys alphabetically (case-insensitive)', () => {
      const dict = { zebra: 1, apple: 2, Banana: 3 };
      const result = dictToXml(dict);
      
      const appleIndex = result.indexOf('apple');
      const bananaIndex = result.indexOf('Banana');
      const zebraIndex = result.indexOf('zebra');
      
      expect(appleIndex).toBeLessThan(bananaIndex);
      expect(bananaIndex).toBeLessThan(zebraIndex);
    });
  });

  describe('generatePlistXml', () => {
    it('should generate valid plist XML', () => {
      const config = {
        startURL: 'https://exam.example.com',
        allowQuit: true,
        browserViewMode: 0,
      };

      const xml = generatePlistXml(config);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<!DOCTYPE plist');
      expect(xml).toContain('<plist version="1.0">');
      expect(xml).toContain('<dict>');
      expect(xml).toContain('</dict>');
      expect(xml).toContain('</plist>');
      expect(xml).toContain('startURL');
      expect(xml).toContain('https://exam.example.com');
      expect(xml).toContain('allowQuit');
      expect(xml).toContain('<true/>');
      expect(xml).toContain('browserViewMode');
      expect(xml).toContain('<integer>0</integer>');
    });

    it('should sort top-level keys alphabetically', () => {
      const config = {
        zebra: 1,
        apple: 2,
        middle: 3,
      };

      const xml = generatePlistXml(config);
      
      const appleIndex = xml.indexOf('apple');
      const middleIndex = xml.indexOf('middle');
      const zebraIndex = xml.indexOf('zebra');
      
      expect(appleIndex).toBeLessThan(middleIndex);
      expect(middleIndex).toBeLessThan(zebraIndex);
    });

    it('should handle complex nested structures', () => {
      const config = {
        urlFilterRules: [
          {
            active: true,
            expression: 'example.com',
            action: 1,
          },
        ],
      };

      const xml = generatePlistXml(config);

      expect(xml).toContain('urlFilterRules');
      expect(xml).toContain('<array>');
      expect(xml).toContain('active');
      expect(xml).toContain('expression');
      expect(xml).toContain('example.com');
    });
  });
});
