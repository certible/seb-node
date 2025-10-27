import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { decompressSEBFile, generateEncryptedSEB, generatePlainSEB, generateSEBConfig } from '../generator.js';

const gunzipAsync = promisify(gunzip);

describe('config generator', () => {
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

      const decompressed = await gunzipAsync(result);

      const prefix = decompressed.subarray(0, 4).toString('utf8');
      expect(prefix).toBe('plnd');
    });
  });

  describe('full integration test', () => {
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

  describe('decompressSEBFile', () => {
    it('should decompress a plain unencrypted SEB file', async () => {
      const config = {
        startURL: 'https://exam.example.com',
        allowQuit: false,
      };

      const result = await generateSEBConfig(config, { encrypt: false });
      const xml = await decompressSEBFile(result.data);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<plist version="1.0">');
      expect(xml).toContain('startURL');
      expect(xml).toContain('https://exam.example.com');
      expect(xml).toContain('allowQuit');
    });

    it('should decompress an encrypted SEB file with correct password', async () => {
      const config = {
        startURL: 'https://secure-exam.example.com',
        allowQuit: true,
      };
      const password = 'test-password-123';

      const result = await generateSEBConfig(config, { encrypt: true, password });
      const xml = await decompressSEBFile(result.data, password);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<plist version="1.0">');
      expect(xml).toContain('startURL');
      expect(xml).toContain('https://secure-exam.example.com');
      expect(xml).toContain('allowQuit');
    });

    it('should throw error when password is missing for encrypted file', async () => {
      const config = {
        startURL: 'https://exam.example.com',
      };
      const password = 'secret-password';

      const result = await generateSEBConfig(config, { encrypt: true, password });

      await expect(decompressSEBFile(result.data)).rejects.toThrow(
        'Password required for encrypted SEB file',
      );
    });

    it('should throw error with wrong password for encrypted file', async () => {
      const config = {
        startURL: 'https://exam.example.com',
      };
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';

      const result = await generateSEBConfig(config, { encrypt: true, password: correctPassword });

      await expect(decompressSEBFile(result.data, wrongPassword)).rejects.toThrow();
    });

    it('should handle plain SEB files generated with generatePlainSEB', async () => {
      const xml = '<?xml version="1.0"?><plist version="1.0"><dict><key>startURL</key><string>https://test.com</string></dict></plist>';
      const sebData = await generatePlainSEB(xml);

      const decompressedXml = await decompressSEBFile(sebData);

      expect(decompressedXml).toBe(xml);
    });

    it('should handle encrypted SEB files generated with generateEncryptedSEB', async () => {
      const xml = '<?xml version="1.0"?><plist version="1.0"><dict><key>allowQuit</key><true/></dict></plist>';
      const password = 'encryption-test-password';
      const sebData = await generateEncryptedSEB(xml, password);

      const decompressedXml = await decompressSEBFile(sebData, password);

      expect(decompressedXml).toBe(xml);
    });

    it('should throw error for invalid SEB file format', async () => {
      const invalidData = Buffer.from('not a valid seb file');

      await expect(decompressSEBFile(invalidData)).rejects.toThrow();
    });
  });
});
