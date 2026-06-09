import { describe, expect, it, vi } from 'vitest';
import planData from '../data/en-US/plan_data.json';
import {
  getAssignMock,
  setGetJSONData,
  setLocation,
} from '../test/helpers/mocks.js';
import { mountHtml, reservePageHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';
import { login } from './lib/session.js';

describe('reserve.js', () => {
  it('redirects when plan-id query is missing', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html');
    await loadPageScript('reserve.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('redirects when plan is not found', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=999');
    await loadPageScript('reserve.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('redirects when user cannot view the plan', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=1');
    login('diana@example.com');
    await loadPageScript('reserve.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });

  it('loads plan details and enables submit', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=1');
    login('clark@example.com');
    await loadPageScript('reserve.js');

    expect($('#plan-name').text()).toBe('Premium plan');
    expect($('#submit-button').prop('disabled')).toBe(false);
    expect($('#username').val()).toBe('Clark Evans');
    expect($('#room-info iframe').length).toBe(1);
  });

  it('loads plan without room page iframe', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=2');
    login('diana@example.com');
    await loadPageScript('reserve.js');

    expect($('#plan-name').text()).toBe('With dinner');
    expect($('#room-info iframe').length).toBe(0);
  });

  it('toggles contact fields', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    $('#contact').val('').trigger('change');
    $('#contact').val('no').trigger('change');
    expect($('#email').parent().hasClass('d-none')).toBe(true);
    expect($('#tel').parent().hasClass('d-none')).toBe(true);

    $('#contact').val('email').trigger('change');
    expect($('#email').parent().hasClass('d-block')).toBe(true);
    expect($('#email').prop('disabled')).toBe(false);
    expect($('#tel').parent().hasClass('d-none')).toBe(true);

    $('#contact').val('tel').trigger('change');
    expect($('#tel').parent().hasClass('d-block')).toBe(true);
    expect($('#tel').prop('disabled')).toBe(false);
    expect($('#email').parent().hasClass('d-none')).toBe(true);
  });

  it('triggers change when datepicker selects a date', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    const options = $('#date').data('datepicker-options');
    options.onSelect.call($('#date')[0]);
    expect($('#date').val()).toBeTruthy();
  });

  it('configures datepicker with 120-day max booking window', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    const options = $('#date').data('datepicker-options');
    expect(options.maxDate).toBe(120);
  });

  it('returns early from total update when date cannot be parsed', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    const before = $('#total-bill').text();
    $('#date').val('not-a-date');
    vi.spyOn($('#date')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#term')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#head-count')[0], 'checkValidity').mockReturnValue(true);
    $('#date').trigger('change');
    expect($('#total-bill').text()).toBe(before);
  });

  it('recalculates total bill when inputs are valid', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    $('#date').val('12/15/2026');
    $('#term').val('2');
    $('#head-count').val('2');
    $('#breakfast').prop('checked', true);
    vi.spyOn($('#date')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#term')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#head-count')[0], 'checkValidity').mockReturnValue(true);
    $('#date').trigger('change');

    expect($('#total-bill').text()).not.toBe('-');
  });

  it('shows dash when calc inputs are invalid', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    vi.spyOn($('#date')[0], 'checkValidity').mockReturnValue(false);
    $('#date').val('');
    $('#date').trigger('change');
    expect($('#total-bill').text()).toBe('-');
  });

  it('stores reservation on valid submit', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    $('#date').val('12/15/2026');
    $('#term').val('2');
    $('#head-count').val('2');
    $('#username').val('Guest User');
    $('#contact').val('no');
    $('#comment').val('Quiet room please');
    vi.spyOn($('#reserve-form')[0], 'checkValidity').mockReturnValue(true);
    vi.spyOn($('#date')[0], 'checkValidity').mockReturnValue(true);
    $('#reserve-form').trigger('submit');

    expect(document.cookie).toContain('transaction=');
    const transactionId = document.cookie.match(/transaction=([^;]+)/)[1];
    const stored = JSON.parse(sessionStorage.getItem(transactionId));
    expect(stored.planName).toBe('Staying without meals');
    expect(stored.comment).toBe('Quiet room please');
  });

  it('validates date on change when date is in the past', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    try {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
      $('#date').val('06/04/2026');
      vi.spyOn($('#date')[0], 'checkValidity').mockReturnValue(true);
      $('#date').trigger('change');
      expect($('#date')[0].validationMessage).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('skips date validation on submit when date input is invalid', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    vi.spyOn($('#date')[0], 'checkValidity').mockReturnValue(false);
    vi.spyOn($('#reserve-form')[0], 'checkValidity').mockReturnValue(false);
    $('#reserve-form').trigger('submit');
    expect($('#reserve-form').hasClass('was-validated')).toBe(true);
  });

  it('returns false and shows validation on invalid submit', async () => {
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=4');
    await loadPageScript('reserve.js');

    vi.spyOn($('#reserve-form')[0], 'checkValidity').mockReturnValue(false);
    $('#username').val('');
    $('#reserve-form').trigger('submit');
    expect($('#reserve-form').hasClass('was-validated')).toBe(true);
  });

  it('redirects when getJSON returns plan user cannot access', async () => {
    setGetJSONData(planData);
    mountHtml(reservePageHtml);
    setLocation('/en-US/reserve.html', '?plan-id=1');
    await loadPageScript('reserve.js');
    expect(getAssignMock()).toHaveBeenCalled();
  });
});
