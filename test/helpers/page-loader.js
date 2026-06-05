import { vi } from 'vitest';

export async function loadPageScript(name) {
  vi.resetModules();
  await import(new URL(`../../src/${name}`, import.meta.url).href);
  await new Promise((resolve) => setTimeout(resolve, 0));
}
