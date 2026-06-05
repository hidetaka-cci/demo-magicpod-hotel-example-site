import { vi } from 'vitest';
import planData from '../../data/en-US/plan_data.json';

let assignMock;
let closeMock;
let confirmMock;
let alertMock;

export function installBrowserMocks() {
  assignMock = vi.fn();
  closeMock = vi.fn();
  confirmMock = vi.fn(() => true);
  alertMock = vi.fn();

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname: '/en-US/index.html',
      search: '',
      origin: 'http://localhost:8080',
      href: 'http://localhost:8080/en-US/index.html',
      assign: assignMock,
    },
  });

  window.close = closeMock;
  window.confirm = confirmMock;
  window.alert = alertMock;

  history.replaceState = vi.fn();

  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  globalThis.URL.revokeObjectURL = vi.fn();

  globalThis.FileReader = class MockFileReader {
    constructor() {
      this.result = 'data:image/png;base64,AAAA';
      this.onload = null;
    }

    readAsDataURL() {
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }
  };

  $.getJSON = vi.fn(() => ({
    done(callback) {
      callback(planData);
      return { fail: () => ({}) };
    },
    fail: () => ({}),
  }));

  $.fn.datepicker = vi.fn(function datepicker(options) {
    this.data('datepicker-options', options);
    return this;
  });
}

export function resetBrowserMocks() {
  assignMock = undefined;
  closeMock = undefined;
  confirmMock = undefined;
  alertMock = undefined;
}

export function getAssignMock() {
  return assignMock;
}

export function getCloseMock() {
  return closeMock;
}

export function getConfirmMock() {
  return confirmMock;
}

export function getAlertMock() {
  return alertMock;
}

export function setLocation(pathname, search = '') {
  const origin = 'http://localhost:8080';
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname,
      search,
      origin,
      href: `${origin}${pathname}${search}`,
      assign: assignMock ?? vi.fn(),
    },
  });
}

export function setGetJSONData(data) {
  $.getJSON = vi.fn(() => ({
    done(callback) {
      callback(data);
      return { fail: () => ({}) };
    },
    fail: () => ({}),
  }));
}
