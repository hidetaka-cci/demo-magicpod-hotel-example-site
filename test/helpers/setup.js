import jquery from 'jquery';
import { afterEach, beforeEach, vi } from 'vitest';
import { installBrowserMocks, resetBrowserMocks } from './mocks.js';

globalThis.$ = globalThis.jQuery = jquery;

beforeEach(() => {
  document.documentElement.lang = 'en-US';
  document.body.innerHTML = '';
  document.cookie = 'session=; max-age=0';
  document.cookie = 'transaction=; max-age=0';
  localStorage.clear();
  sessionStorage.clear();
  installBrowserMocks();

  // Run ready handlers immediately so repeated dynamic imports do not stack.
  jquery.fn.ready = function ready(fn) {
    if (fn) {
      fn.call(document, jquery);
    }
    return this;
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  resetBrowserMocks();
});
