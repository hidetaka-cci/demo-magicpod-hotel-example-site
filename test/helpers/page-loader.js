import { vi } from 'vitest';

export async function loadPageScript(name) {
  vi.resetModules();
  await import(`../../src/${name}`);
  await new Promise((resolve) => setTimeout(resolve, 0));
}
