import { describe, expect, it } from 'vitest';
import { navbarHtml, mountHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';
import { login } from './lib/session.js';

describe('index.js', () => {
  it('shows logged-in navbar when session exists', async () => {
    mountHtml(navbarHtml);
    login('clark@example.com');
    await loadPageScript('index.js');
    expect($('#signup-holder').hasClass('d-none')).toBe(true);
    expect($('#mypage-holder').hasClass('d-block')).toBe(true);
  });

  it('leaves guest navbar when session is absent', async () => {
    mountHtml(navbarHtml);
    await loadPageScript('index.js');
    expect($('#signup-holder').hasClass('d-block')).toBe(true);
    expect($('#login-holder').hasClass('d-block')).toBe(true);
  });
});
