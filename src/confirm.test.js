import { describe, expect, it } from 'vitest';
import {
  getAssignMock,
  getCloseMock,
  setLocation,
} from '../test/helpers/mocks.js';
import { confirmPageHtml, mountHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';

describe('confirm.js', () => {
  it('redirects when transaction cookie is missing', async () => {
    mountHtml(confirmPageHtml);
    setLocation('/en-US/confirm.html');
    await loadPageScript('confirm.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('redirects when session storage data is missing', async () => {
    mountHtml(confirmPageHtml);
    setLocation('/en-US/confirm.html');
    document.cookie = 'transaction=missing-id';
    await loadPageScript('confirm.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('renders reservation details and clears transaction state', async () => {
    mountHtml(confirmPageHtml);
    setLocation('/en-US/confirm.html');
    document.cookie = 'transaction=tx-123';
    const reservation = {
      roomBill: 100,
      planName: 'Premium plan',
      date: '2026-07-01',
      term: 2,
      headCount: 2,
      breakfast: true,
      earlyCheckIn: true,
      sightseeing: true,
      username: 'Clark Evans',
      contact: 'email',
      email: 'clark@example.com',
      tel: '',
      comment: 'Late arrival',
    };
    sessionStorage.setItem('tx-123', JSON.stringify(reservation));

    await loadPageScript('confirm.js');

    expect($('#plan-name').text()).toBe('Premium plan');
    expect($('#username').text()).toContain('Clark Evans');
    expect($('#contact').text()).toContain('clark@example.com');
    expect($('#comment').text()).toBe('Late arrival');
    expect($('#plans').html()).toContain('Breakfast');
    expect($('#plans').html()).toContain('Early check-in');
    expect($('#plans').html()).toContain('Sightseeing');
    expect(document.cookie).not.toContain('transaction=tx-123');
    expect(sessionStorage.getItem('tx-123')).toBeNull();
  });

  it('renders email contact variant', async () => {
    mountHtml(confirmPageHtml);
    setLocation('/en-US/confirm.html');
    document.cookie = 'transaction=tx-email';
    sessionStorage.setItem(
      'tx-email',
      JSON.stringify({
        roomBill: 70,
        planName: 'Business trip',
        date: '2026-07-10',
        term: 1,
        headCount: 1,
        breakfast: false,
        earlyCheckIn: false,
        sightseeing: false,
        username: 'Guest',
        contact: 'email',
        email: 'guest@example.com',
        tel: '',
        comment: '',
      }),
    );

    await loadPageScript('confirm.js');
    expect($('#contact').text()).toContain('guest@example.com');
  });

  it('renders no-addons and tel contact variants', async () => {
    mountHtml(confirmPageHtml);
    setLocation('/en-US/confirm.html');
    document.cookie = 'transaction=tx-456';
    sessionStorage.setItem(
      'tx-456',
      JSON.stringify({
        roomBill: 70,
        planName: 'Economical',
        date: '2026-07-10',
        term: 1,
        headCount: 1,
        breakfast: false,
        earlyCheckIn: false,
        sightseeing: false,
        username: 'Guest',
        contact: 'tel',
        email: '',
        tel: '01234567890',
        comment: '',
      }),
    );

    await loadPageScript('confirm.js');

    expect($('#plans').text()).toBe('none');
    expect($('#contact').text()).toContain('01234567890');
    expect($('#comment').text()).toBe('none');
  });

  it('leaves contact empty for unknown confirmation type', async () => {
    mountHtml(confirmPageHtml);
    setLocation('/en-US/confirm.html');
    document.cookie = 'transaction=tx-unknown';
    sessionStorage.setItem(
      'tx-unknown',
      JSON.stringify({
        roomBill: 70,
        planName: 'Business trip',
        date: '2026-07-10',
        term: 1,
        headCount: 1,
        breakfast: false,
        earlyCheckIn: false,
        sightseeing: false,
        username: 'Guest',
        contact: 'unknown',
        email: '',
        tel: '',
        comment: '',
      }),
    );

    await loadPageScript('confirm.js');
    expect($('#contact').text()).toBe('');
  });

  it('closes window when success modal is hidden', async () => {
    mountHtml(confirmPageHtml);
    setLocation('/en-US/confirm.html');
    document.cookie = 'transaction=tx-789';
    sessionStorage.setItem(
      'tx-789',
      JSON.stringify({
        roomBill: 70,
        planName: 'Economical',
        date: '2026-07-10',
        term: 1,
        headCount: 1,
        breakfast: false,
        earlyCheckIn: false,
        sightseeing: false,
        username: 'Guest',
        contact: 'no',
        email: '',
        tel: '',
        comment: '',
      }),
    );

    await loadPageScript('confirm.js');
    $('#success-modal').trigger('hidden.bs.modal');
    expect(getCloseMock()).toHaveBeenCalled();
  });
});
