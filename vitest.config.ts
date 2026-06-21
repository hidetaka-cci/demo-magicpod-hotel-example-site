import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/helpers/setup.js'],
    include: ['src/**/*.test.js', 'test/**/*.test.js'],
    fileParallelism: false,
    testTimeout: 180_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js', 'src/lib/test/**'],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
      reporter: ['text', 'lcov'],
    },
  },
});
