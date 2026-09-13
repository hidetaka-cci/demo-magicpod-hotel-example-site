import { describe, expect, it, vi } from 'vitest';
import {
  resetCustomValidity,
  setValidityMessage,
  validateDateInput,
} from './validation.js';

function mountInput(validity, options = {}) {
  const input = document.createElement('input');
  input.type = options.type || 'text';
  Object.defineProperty(input, 'validity', { value: validity });
  Object.defineProperty(input, 'validationMessage', {
    value: options.validationMessage ?? '',
    configurable: true,
  });
  if (options.maxLength !== undefined) input.maxLength = options.maxLength;
  if (options.minLength !== undefined) input.minLength = options.minLength;
  if (options.max !== undefined) input.max = options.max;
  if (options.min !== undefined) input.min = options.min;

  const feedback = document.createElement('div');
  feedback.className = 'invalid-feedback';
  const wrapper = document.createElement('div');
  wrapper.appendChild(input);
  wrapper.appendChild(feedback);
  document.body.appendChild(wrapper);
  return input;
}

describe('resetCustomValidity', () => {
  it('clears custom validity on all inputs', () => {
    const input = mountInput({ customError: true });
    input.setCustomValidity = vi.fn();
    resetCustomValidity($(input));
    expect(input.setCustomValidity).toHaveBeenCalledWith('');
  });
});

describe('setValidityMessage', () => {
  it('sets custom error message', () => {
    const input = mountInput(
      { customError: true },
      { validationMessage: 'Custom error' },
    );
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe('Custom error');
  });

  it('sets valueMissing message', () => {
    const input = mountInput({ valueMissing: true });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please fill out this field.',
    );
  });

  it('sets email typeMismatch message', () => {
    const input = mountInput({ typeMismatch: true }, { type: 'email' });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please enter a non-empty email address.',
    );
  });

  it('sets url typeMismatch message', () => {
    const input = mountInput({ typeMismatch: true }, { type: 'url' });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please enter a non-empty URL.',
    );
  });

  it('sets badInput for other typeMismatch types', () => {
    const input = mountInput({ typeMismatch: true }, { type: 'text' });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please enter a valid value.',
    );
  });

  it('sets tooLong message', () => {
    const input = mountInput({ tooLong: true }, { maxLength: 140 });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please shorten this text to 140 characters or less.',
    );
  });

  it('sets tooShort message', () => {
    const input = mountInput({ tooShort: true }, { minLength: 8 });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please lengthen this text to 8 characters or more.',
    );
  });

  it('sets rangeOverflow message', () => {
    const input = mountInput({ rangeOverflow: true }, { max: 9 });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Value must be less than or equal to 9.',
    );
  });

  it('sets rangeUnderflow message', () => {
    const input = mountInput({ rangeUnderflow: true }, { min: 1 });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Value must be greater than or equal to 1.',
    );
  });

  it('sets stepMismatch message', () => {
    const input = mountInput({ stepMismatch: true });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please enter a valid value.',
    );
  });

  it('sets badInput message', () => {
    const input = mountInput({ badInput: true });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please enter a valid value.',
    );
  });

  it('sets patternMismatch message', () => {
    const input = mountInput({ patternMismatch: true });
    setValidityMessage($(input));
    expect($(input).nextAll('.invalid-feedback').text()).toBe(
      'Please match the requested format.',
    );
  });
});

describe('validateDateInput', () => {
  it('returns badInput when date is falsy', () => {
    expect(validateDateInput(null)).toBe('Please enter a valid value.');
  });

  it('returns message for past dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
    expect(validateDateInput(new Date(2026, 5, 4))).toBe(
      'Please enter a date after tomorrow.',
    );
    vi.useRealTimers();
  });

  it('returns message for dates beyond 90 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
    expect(validateDateInput(new Date(2026, 9, 5))).toBe(
      'Please enter a date within 3 months.',
    );
    vi.useRealTimers();
  });

  it('returns undefined for valid future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
    expect(validateDateInput(new Date(2026, 6, 1))).toBeUndefined();
    vi.useRealTimers();
  });
});
