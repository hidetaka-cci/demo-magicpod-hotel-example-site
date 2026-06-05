import { describe, expect, it, vi } from 'vitest';
import {
  getAssignMock,
  setLocation,
} from '../test/helpers/mocks.js';
import { iconPageHtml, mountHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';
import { getSessionUser, login } from './lib/session.js';

function makeFile({ name = 'icon.png', type = 'image/png', size = 100 } = {}) {
  const file = new File(['x'.repeat(size)], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function setInputFiles(input, file) {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: file ? [file] : [],
  });
}

describe('icon.js', () => {
  it('redirects when not logged in', async () => {
    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    try {
      await loadPageScript('icon.js');
    } catch {
      // icon.js redirects without returning, then accesses a null user.
    }
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('redirects for preset users', async () => {
    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login('clark@example.com');
    await loadPageScript('icon.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('clears preview when file input is cleared', async () => {
    const email = 'icon-user@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Icon User',
        rank: 'normal',
      }),
    );

    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login(email);
    await loadPageScript('icon.js');

    const input = $('#icon')[0];
    setInputFiles(input, makeFile());
    $('#icon').trigger('change');
    expect($('#icon-holder img').length).toBe(1);

    setInputFiles(input, null);
    $('#icon').trigger('change');
    expect($('#icon-holder').is(':empty')).toBe(true);
    expect($('#zoom').prop('disabled')).toBe(true);
  });

  it('rejects files larger than 10 KB', async () => {
    const email = 'large-file@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Large File',
        rank: 'normal',
      }),
    );

    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login(email);
    await loadPageScript('icon.js');

    setInputFiles($('#icon')[0], makeFile({ size: 11 * 1024 }));
    $('#icon').trigger('change');
    expect($('#icon-form').hasClass('was-validated')).toBe(true);
    expect($('#zoom').prop('disabled')).toBe(true);
  });

  it('rejects non-image files', async () => {
    const email = 'text-file@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Text File',
        rank: 'normal',
      }),
    );

    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login(email);
    await loadPageScript('icon.js');

    setInputFiles($('#icon')[0], makeFile({ type: 'text/plain' }));
    $('#icon').trigger('change');
    expect($('#icon-form').hasClass('was-validated')).toBe(true);
  });

  it('previews image and updates zoom and color', async () => {
    const email = 'preview@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Preview User',
        rank: 'normal',
      }),
    );

    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login(email);
    await loadPageScript('icon.js');

    setInputFiles($('#icon')[0], makeFile());
    $('#icon').trigger('change');
    expect($('#icon-img').length).toBe(1);
    $('#icon-img').trigger('load');
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    expect($('#zoom').prop('disabled')).toBe(false);

    $('#zoom').val('50').trigger('change');
    expect($('#icon-img').width()).toBe(50);

    $('#color').val('#00ff00').trigger('change');
    expect($('#icon-img').css('backgroundColor')).toBe('#00ff00');
  });

  it('saves icon data on valid submit', async () => {
    const email = 'save-icon@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Save Icon',
        rank: 'normal',
      }),
    );

    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login(email);
    await loadPageScript('icon.js');

    setInputFiles($('#icon')[0], makeFile());
    $('#icon').trigger('change');
    $('#zoom').val('80');
    $('#color').val('#123456');
    const form = $('#icon-form')[0];
    vi.spyOn(form, 'checkValidity').mockReturnValue(true);
    $('#icon-form').trigger('submit');

    const saved = JSON.parse(localStorage.getItem(email));
    expect(saved.icon.width).toBe(80);
    expect(saved.icon.color).toBe('#123456');
    expect(saved.icon.image).toContain('data:image');
  });

  it('shows validation state on invalid submit', async () => {
    const email = 'invalid-submit@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Invalid Submit',
        rank: 'normal',
      }),
    );

    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login(email);
    await loadPageScript('icon.js');

    vi.spyOn($('#icon-form')[0], 'checkValidity').mockReturnValue(false);
    $('#icon-form').trigger('submit');
    expect($('#icon-form').hasClass('was-validated')).toBe(true);
  });

  it('logs out from navbar form', async () => {
    const email = 'logout-icon@example.com';
    localStorage.setItem(
      email,
      JSON.stringify({
        email,
        password: 'password123',
        username: 'Logout Icon',
        rank: 'normal',
      }),
    );

    mountHtml(iconPageHtml);
    setLocation('/en-US/icon.html');
    login(email);
    await loadPageScript('icon.js');

    $('#logout-form').trigger('submit');
    expect(getSessionUser()).toBe('');
  });
});
