import {t} from './messages.js';

export const BOOKING_WINDOW_DAYS = 120;

/**
 * Reset all validation states
 * @param  {jQuery} $inputs
 */
export function resetCustomValidity($inputs) {
  $inputs.each(function() {
    this.setCustomValidity('');
  });
}

/**
 * Set all validation masseges
 * @param  {jQuery} $inputs
 */
export function setValidityMessage($inputs) {
  $inputs.each(function() {
    $(this).nextAll('.invalid-feedback').text(getErrorMessege(this));
  });
}

/**
 * Get error messege
 * @param {HTMLInputElement} input
 * @return {string} error messege
 */
function getErrorMessege(input) {
  if (input.validity.customError) {
    return input.validationMessage;
  } else if (input.validity.valueMissing) {
    return t('validation.valueMissing');
  } else if (input.validity.typeMismatch) {
    if (input.type === 'email') {
      return t('validation.typeMismatch.email');
    } else if (input.type === 'url') {
      return t('validation.typeMismatch.url');
    } else {
      return t('validation.badInput');
    }
  } else if (input.validity.tooLong) {
    return t('validation.tooLong', input.maxLength);
  } else if (input.validity.tooShort) {
    return t('validation.tooShort', input.minLength);
  } else if (input.validity.rangeOverflow) {
    return t('validation.rangeOverflow', input.max);
  } else if (input.validity.rangeUnderflow) {
    return t('validation.rangeUnderflow', input.min);
  } else if (input.validity.stepMismatch) {
    return t('validation.badInput');
  } else if (input.validity.badInput) {
    return t('validation.badInput');
  } else if (input.validity.patternMismatch) {
    return t('validation.patternMismatch');
  }
}

/**
 * Validation for date Input
 * @param {Date} date
 * @return {string} error messege
 */
export function validateDateInput(date) {
  if (!date) {
    return t('validation.badInput');
  } else {
    const now = new Date();
    const bookingDeadline = new Date();
    bookingDeadline.setDate(bookingDeadline.getDate() + BOOKING_WINDOW_DAYS);
    if (date.getTime() < now.getTime()) {
      return t('validation.shoudBeNextDay');
    } else if (date.getTime() > bookingDeadline.getTime()) {
      return t('validation.shouldBeFourMonth');
    }
  }
}
