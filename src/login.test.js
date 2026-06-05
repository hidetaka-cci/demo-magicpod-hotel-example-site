import { describe, expect, it, vi } from 'vitest';
import {
  getAssignMock,
  setLocation,
} from '../test/helpers/mocks.js';
import { loginFormHtml, mountHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';
import { getSessionUser, login } from './lib/session.js';

describe('login.js', () => {
  it('redirects to top when already logged in', async () => {
    mountHtml(loginFormHtml);
    setLocation('/en-US/login.html');
    login('clark@example.com');
    await loadPageScript('login.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('logs in with valid credentials', async () => {
    mountHtml(loginFormHtml);
    setLocation('/en-US/login.html');
    await loadPageScript('login.js');

    $('#email').val('clark@example.com');
    $('#password').val('password');
    $('#login-form').trigger('submit');

    expect(getSessionUser()).toBe('clark@example.com');
  });

  it('skips credential check when inputs are invalid', async () => {
    mountHtml(loginFormHtml);
    setLocation('/en-US/login.html');
    await loadPageScript('login.js');

    $('#email').val('');
    vi.spyOn($('#email')[0], 'checkValidity').mockReturnValue(false);
    vi.spyOn($('#login-form')[0], 'checkValidity').mockReturnValue(false);
    $('#login-form').trigger('submit');

    expect(getSessionUser()).toBe('');
    expect($('#login-form').hasClass('was-validated')).toBe(true);
  });

  it('shows validation errors for invalid credentials', async () => {
    mountHtml(loginFormHtml);
    setLocation('/en-US/login.html');
    await loadPageScript('login.js');

    $('#email').val('clark@example.com');
    $('#password').val('wrong-password');
    vi.spyOn($('#email')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#password')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#login-form')[0], 'checkValidity').mockReturnValue(false);
    $('#login-form').trigger('submit');

    expect(getSessionUser()).toBe('');
    expect($('#login-form').hasClass('was-validated')).toBe(true);
  });
});
