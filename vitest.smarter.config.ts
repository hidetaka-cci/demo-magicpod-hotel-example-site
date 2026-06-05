import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

// Used by test-suites.yml `analysis` only (TIA impact map via CIRCLECI_COVERAGE).
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      runner: '@circleci/vitest-circleci-coverage/runner',
      reporters: ['default', '@circleci/vitest-circleci-coverage/reporter'],
      coverage: {
        thresholds: undefined,
      },
    },
  }),
);
