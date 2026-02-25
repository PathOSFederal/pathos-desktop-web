import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const repoRoot = resolve(__dirname, '..', '..', '..');

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@pathos/ui-web',
        replacement: resolve(repoRoot, 'packages', 'ui-web', 'src'),
      },
      {
        find: '@pathos/core',
        replacement: resolve(repoRoot, 'packages', 'core', 'src'),
      },
      {
        find: '@pathos/adapters',
        replacement: resolve(repoRoot, 'packages', 'adapters', 'src'),
      },
      {
        find: '@pathos/api',
        replacement: resolve(repoRoot, 'packages', 'api', 'src'),
      },
    ],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
