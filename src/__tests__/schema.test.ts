import { describe, it, expect } from 'vitest';
import { sebConfigSchema } from '../schema.js';

describe('SEB Config Schema', () => {
  describe('sebConfigSchema', () => {
    it('should validate a minimal valid config', () => {
      const config = {
        startURL: 'https://exam.example.com',
      };

      const result = sebConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const config = {
        startURL: 'not-a-valid-url',
      };

      const result = sebConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should apply default values', () => {
      const config = {
        startURL: 'https://exam.example.com',
      };

      const result = sebConfigSchema.parse(config);
      expect(result.allowQuit).toBe(true);
      expect(result.browserViewMode).toBe(0);
      expect(result.originatorVersion).toBe('3.7.0');
    });

    it('should validate browserViewMode range', () => {
      const validConfig = {
        startURL: 'https://exam.example.com',
        browserViewMode: 1,
      };

      const invalidConfig = {
        startURL: 'https://exam.example.com',
        browserViewMode: 5,
      };

      expect(sebConfigSchema.safeParse(validConfig).success).toBe(true);
      expect(sebConfigSchema.safeParse(invalidConfig).success).toBe(false);
    });

    it('should validate audio volume level range', () => {
      const validConfig = {
        startURL: 'https://exam.example.com',
        audioVolumeLevel: 50,
      };

      const invalidConfig = {
        startURL: 'https://exam.example.com',
        audioVolumeLevel: 150,
      };

      expect(sebConfigSchema.safeParse(validConfig).success).toBe(true);
      expect(sebConfigSchema.safeParse(invalidConfig).success).toBe(false);
    });

    it('should validate URL filter rules', () => {
      const config = {
        startURL: 'https://exam.example.com',
        urlFilterRules: [
          {
            active: true,
            regex: false,
            expression: 'example.com',
            action: 1,
          },
        ],
      };

      const result = sebConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate additional resources', () => {
      const config = {
        startURL: 'https://exam.example.com',
        additionalResources: [
          {
            active: true,
            autoOpen: false,
            confirm: false,
            iconInTaskbar: true,
            URL: 'https://resource.example.com',
            title: 'Calculator',
          },
        ],
      };

      const result = sebConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should accept Buffer for examKeySalt', () => {
      const config = {
        startURL: 'https://exam.example.com',
        examKeySalt: Buffer.from('test-salt-32-bytes-long-string!!'),
      };

      const result = sebConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });
});
