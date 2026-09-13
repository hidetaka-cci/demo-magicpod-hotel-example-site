import { describe, expect, it } from 'vitest';
import { t } from './messages.js';

describe('t', () => {
  it('resolves nested message keys', () => {
    expect(t('validation.valueMissing')).toBe('Please fill out this field.');
    expect(t('validation.typeMismatch.email')).toBe(
      'Please enter a non-empty email address.',
    );
  });

  it('replaces placeholders with params', () => {
    expect(t('validation.tooLong', '140')).toBe(
      'Please shorten this text to 140 characters or less.',
    );
    expect(t('validation.tooShort', '8')).toBe(
      'Please lengthen this text to 8 characters or more.',
    );
  });
});
