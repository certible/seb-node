import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/web.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  fixedExtension: false,
});
