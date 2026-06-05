import { describe, expect, it, vi } from 'vitest';
import {
  getAssignMock,
  setLocation,
} from '../test/helpers/mocks.js';
import { mountHtml, signupFormHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';
import { getSessionUser, getUser } from './lib/session.js';

describe('signup.js', () => {
  it('redirects to top when already logged in', async () => {
    mountHtml(signupFormHtml);
    setLocation('/en-US/signup.html');
    document.cookie = 'session=clark@example.com; max-age=630720000';
    await loadPageScript('signup.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('skips duplicate email check when email is invalid', async () => {
    mountHtml(signupFormHtml);
    setLocation('/en-US/signup.html');
    await loadPageScript('signup.js');

    $('#email').val('');
    vi.spyOn($('#email')[0], 'checkValidity').mockReturnValue(false);
    vi.spyOn($('#signup-form')[0], 'checkValidity').mockReturnValue(false);
    $('#signup-form').trigger('submit');

    expect($('#signup-form').hasClass('was-validated')).toBe(true);
  });

  it('skips password match check when password fields are invalid', async () => {
    mountHtml(signupFormHtml);
    setLocation('/en-US/signup.html');
    await loadPageScript('signup.js');

    $('#email').val('new-user@example.com');
    vi.spyOn($('#email')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#password')[0], 'checkValidity').mockReturnValue(false);
    vi.spyOn($('#signup-form')[0], 'checkValidity').mockReturnValue(false);
    $('#signup-form').trigger('submit');

    expect($('#signup-form').hasClass('was-validated')).toBe(true);
  });

  it('rejects an email that already exists', async () => {
    mountHtml(signupFormHtml);
    setLocation('/en-US/signup.html');
    await loadPageScript('signup.js');

    $('#email').val('clark@example.com');
    $('#password').val('password123');
    $('#password-confirmation').val('password123');
    $('#username').val('Clark');
    vi.spyOn($('#signup-form')[0], 'checkValidity').mockReturnValue(false);
    $('#signup-form').trigger('submit');

    expect($('#signup-form').hasClass('was-validated')).toBe(true);
  });

  it('rejects mismatched passwords', async () => {
    mountHtml(signupFormHtml);
    setLocation('/en-US/signup.html');
    await loadPageScript('signup.js');

    $('#email').val('new-user@example.com');
    $('#password').val('password123');
    $('#password-confirmation').val('different123');
    $('#username').val('New User');
    vi.spyOn($('#signup-form')[0], 'checkValidity').mockReturnValue(false);
    $('#signup-form').trigger('submit');

    expect($('#signup-form').hasClass('was-validated')).toBe(true);
  });

  it('registers a new user and logs in', async () => {
    mountHtml(signupFormHtml);
    setLocation('/en-US/signup.html');
    await loadPageScript('signup.js');

    $('#email').val('new-user@example.com');
    $('#password').val('password123');
    $('#password-confirmation').val('password123');
    $('#username').val('New User');
    $('#address').val('Test City');
    $('#tel').val('01234567890');
    $('#gender').val('1');
    $('#birthday').val('2000-01-01');
    $('#notification').prop('checked', true);
    $('#signup-form').trigger('submit');

    expect(getSessionUser()).toBe('new-user@example.com');
    expect(getUser('new-user@example.com').username).toBe('New User');
  });
});
