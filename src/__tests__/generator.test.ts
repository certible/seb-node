import { describe, it, expect } from 'vitest';
import { generateSEBConfig, generatePlainSEB } from '../generator.js';
import { gunzip } from 'zlib';
import { promisify } from 'util';

const gunzipAsync = promisify(gunzip);

describe('SEB Config Generator', () => {
  describe('generateSEBConfig', () => {
    it('should generate a valid SEB config file', async () => {
      const config = {
        startURL: 'https://exam.example.com',
        allowQuit: false,
        browserViewMode: 1,
      };

      const result = await generateSEBConfig(config);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.xml).toContain('<?xml version="1.0"');
      expect(result.xml).toContain('<plist version="1.0">');
      expect(result.xml).toContain('startURL');
      expect(result.xml).toContain('https://exam.example.com');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should validate config against schema by default', async () => {
      const invalidConfig = {
        startURL: 'not-a-url', // Invalid URL
      };

      await expect(generateSEBConfig(invalidConfig)).rejects.toThrow();
    });

    it('should skip validation when requested', async () => {
      const invalidConfig = {
        startURL: 'not-a-url',
      };

      const result = await generateSEBConfig(invalidConfig, { validate: false });
      expect(result).toBeDefined();
    });

    it('should include default values from schema', async () => {
      const config = {
        startURL: 'https://exam.example.com',
      };

      const result = await generateSEBConfig(config);

      expect(result.xml).toContain('originatorVersion');
      expect(result.xml).toContain('3.7.0');
      expect(result.xml).toContain('allowQuit');
    });

    it('should handle URL filter rules', async () => {
      const config = {
        startURL: 'https://exam.example.com',
        enableURLFilter: true,
        urlFilterRules: [
          {
            active: true,
            regex: false,
            expression: 'example.com',
            action: 1,
          },
        ],
      };

      const result = await generateSEBConfig(config);

      expect(result.xml).toContain('urlFilterRules');
      expect(result.xml).toContain('example.com');
      expect(result.xml).toContain('action');
    });
  });

  describe('generatePlainSEB', () => {
    it('should generate unencrypted SEB file with plnd prefix', async () => {
      const xml = '<?xml version="1.0"?><plist version="1.0"><dict></dict></plist>';
      const result = await generatePlainSEB(xml);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Decompress outer layer
      const decompressed = await gunzipAsync(result);

      // Check for "plnd" prefix
      const prefix = decompressed.slice(0, 4).toString('utf8');
      expect(prefix).toBe('plnd');
    });
  });

  describe('Full integration test', () => {
    it('should create a complete exam configuration', async () => {
      const appointmentId = 'exam-12345';
      const random = 'random-67890';
      const examUrl = `https://exam.example.com?id=${appointmentId}&random=${random}`;

      const config = {
        startURL: examUrl,
        allowQuit: true,
        browserViewMode: 0,
        enableURLFilter: true,
        urlFilterRules: [
          {
            active: true,
            regex: false,
            expression: 'example.com',
            action: 1,
          },
        ],
        allowAudioCapture: true,
        allowVideoCapture: true,
        sendBrowserExamKey: true,
        browserExamKeySalt: true,
        browserURLSalt: true,
        examKeySalt: Buffer.from('examKeySalt'),
      };

      const result = await generateSEBConfig(config);

      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.size).toBeGreaterThan(0);
      expect(result.xml).toContain('exam-12345'); // Check for ID in URL
      expect(result.xml).toContain('example.com');
      expect(result.xml).toContain('examKeySalt');
    });
  });
});
