import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const deployConfigPath = resolve(__dirname, '..', '.circleci', 'deploy.yml');
const approvalConfigPath = resolve(
  __dirname,
  '..',
  '.circleci',
  'config.with-approval.yml',
);

function findBatchRunInvocation(yamlText) {
  const lines = yamlText.split('\n');
  return lines.find((line) => line.includes('magicpod-api-client batch-run'));
}

describe('MagicPod batch-run invocation in CircleCI configs', () => {
  it('deploy.yml triggers batch-run with -n so the job exits without waiting for cloud results', () => {
    const yaml = readFileSync(deployConfigPath, 'utf8');
    const invocation = findBatchRunInvocation(yaml);
    expect(invocation, 'magicpod-api-client batch-run line should exist').toBeDefined();
    expect(
      invocation,
      'deploy.yml must invoke batch-run with -n; otherwise the client waits on Cloud test results and hits "403 Forbidden: The Cloud test run feature is not accessible under your plan."',
    ).toMatch(/batch-run\s+(?:[^\n]*\s)?-n(\s|$)/);
  });

  it('config.with-approval.yml keeps batch-run -n to match deploy.yml semantics', () => {
    const yaml = readFileSync(approvalConfigPath, 'utf8');
    const invocation = findBatchRunInvocation(yaml);
    expect(invocation).toBeDefined();
    expect(invocation).toMatch(/batch-run\s+(?:[^\n]*\s)?-n(\s|$)/);
  });
});
