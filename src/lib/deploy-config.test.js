import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '..', '..');

function readDeployYml() {
  return readFileSync(
    resolve(projectRoot, '.circleci', 'deploy.yml'),
    'utf8',
  );
}

function extractCommandBlock(yml, commandName) {
  const lines = yml.split('\n');
  const startIdx = lines.findIndex((line) =>
    line.match(new RegExp(`^ {2}${commandName}:`)),
  );
  if (startIdx === -1) return null;
  const endIdx = lines.findIndex(
    (line, idx) => idx > startIdx && line.match(/^ {2}\S/),
  );
  return lines.slice(startIdx, endIdx === -1 ? undefined : endIdx).join('\n');
}

describe('.circleci/deploy.yml S3 sync region', () => {
  it('sync-publish-to-s3 explicitly passes AWS region so aws s3 sync does not build https://s3..amazonaws.com', () => {
    const yml = readDeployYml();
    const block = extractCommandBlock(yml, 'sync-publish-to-s3');
    expect(block).not.toBeNull();
    expect(block).toMatch(/--region\s+["']?\$\{?AWS_REGION\}?["']?/);
  });
});
