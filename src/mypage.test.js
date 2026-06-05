import { describe, expect, it, vi } from 'vitest';
import {
  getAlertMock,
  getAssignMock,
  getConfirmMock,
  setLocation,
} from '../test/helpers/mocks.js';
import { mountHtml, mypageHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';
import { getSessionUser, login } from './lib/session.js';

describe('mypage.js', () => {
  it('redirects when not logged in', async () => {
    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    await loadPageScript('mypage.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('displays premium preset user data', async () => {
    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    login('clark@example.com');
    await loadPageScript('mypage.js');

    expect($('#email').text()).toBe('clark@example.com');
    expect($('#username').text()).toBe('Clark Evans');
    expect($('#rank').text()).toBe('Premium');
    expect($('#icon-link').hasClass('disabled')).toBe(true);
    expect($('#delete-form > button').prop('disabled')).toBe(true);
  });

  it('leaves rank empty for unknown membership', async () => {
    const email = 'unknown-rank@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Unknown Rank',
        rank: 'guest',
      }),
    );

    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    login(email);
    await loadPageScript('mypage.js');

    expect($('#rank').text()).toBe('');
  });

  it('displays normal user data with optional fields', async () => {
    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    login('diana@example.com');
    await loadPageScript('mypage.js');

    expect($('#rank').text()).toBe('Normal');
    expect($('#birthday').text()).toContain('2000');
    expect($('#notification').text()).toBe('not received');
  });

  it('enables delete and icon actions for non-preset users', async () => {
    const email = 'custom@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Custom User',
        rank: 'normal',
        address: '',
        tel: '',
        gender: '0',
        birthday: '',
        notification: false,
      }),
    );

    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    login(email);
    await loadPageScript('mypage.js');

    expect($('#icon-link').hasClass('disabled')).toBe(false);
    expect($('#delete-form > button').prop('disabled')).toBe(false);
    expect($('#address').text()).toBe('not answered');
  });

  it('deletes non-preset account when confirmed', async () => {
    const email = 'delete-me@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Delete Me',
        rank: 'normal',
        address: 'Somewhere',
        tel: '01234567890',
        gender: '9',
        birthday: '1990-05-01',
        notification: true,
        icon: {
          image: 'data:image/png;base64,AAAA',
          width: 80,
          height: 80,
          color: '#ff0000',
        },
      }),
    );

    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    login(email);
    await loadPageScript('mypage.js');

    expect($('#icon-holder img').length).toBe(1);
    $('#delete-form').trigger('submit');
    expect(getConfirmMock()).toHaveBeenCalled();
    expect(getSessionUser()).toBe('');
    expect(localStorage.getItem(email)).toBeNull();
    expect(getAlertMock()).toHaveBeenCalled();
  });

  it('cancels delete when confirmation is rejected', async () => {
    const email = 'keep-me@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Keep Me',
        rank: 'normal',
      }),
    );
    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    login(email);
    await loadPageScript('mypage.js');

    window.confirm = vi.fn(() => false);
    $('#delete-form').trigger('submit');
    expect(window.confirm).toHaveBeenCalled();
    expect(localStorage.getItem(email)).not.toBeNull();
  });

  it('logs out from navbar form', async () => {
    mountHtml(mypageHtml);
    setLocation('/en-US/mypage.html');
    login('clark@example.com');
    await loadPageScript('mypage.js');

    $('#logout-form').trigger('submit');
    expect(getSessionUser()).toBe('');
  });
});
