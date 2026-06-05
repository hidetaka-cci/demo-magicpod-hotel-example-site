import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { getAssignMock, setLocation } from '../../test/helpers/mocks.js';
import { navbarHtml } from '../../test/helpers/dom-fixtures.js';
import { pbtOptions } from '../../test/helpers/pbt.js';
import {
  canDisplayPlan,
  deleteTransactionId,
  genTransactionId,
  getSessionUser,
  getTransactionId,
  getUser,
  isValidUser,
  login,
  logout,
  redirectToTop,
  setLoginNavbar,
} from './session.js';

describe('canDisplayPlan', () => {
  it('returns true when plan has no restriction', () => {
    expect(canDisplayPlan({}, { rank: 'member' })).toBe(true);
    expect(canDisplayPlan({}, null)).toBe(true);
  });

  it('returns false for member-only plan when user is null', () => {
    expect(canDisplayPlan({ only: 'member' }, null)).toBe(false);
  });

  it('returns true for member-only plan when user exists', () => {
    expect(canDisplayPlan({ only: 'member' }, { rank: 'member' })).toBe(true);
  });

  it('returns true for premium-only plan when user is premium', () => {
    expect(canDisplayPlan({ only: 'premium' }, { rank: 'premium' })).toBe(
      true,
    );
  });

  it('returns false for premium-only plan when user is not premium', () => {
    expect(canDisplayPlan({ only: 'premium' }, { rank: 'member' })).toBe(false);
  });

  it('returns undefined for unknown restriction with user present', () => {
    expect(canDisplayPlan({ only: 'unknown' }, { rank: 'member' })).toBeUndefined();
  });
});

describe('getUser', () => {
  it('returns preset user and marks preset flag', () => {
    const user = getUser('clark@example.com');
    expect(user.email).toBe('clark@example.com');
    expect(user.preset).toBe(true);
  });

  it('returns user from localStorage when not preset', () => {
    const stored = {
      email: 'test@example.com',
      password: 'password1',
      username: 'Test User',
      rank: 'normal',
    };
    localStorage.setItem('test@example.com', JSON.stringify(stored));
    const user = getUser('test@example.com');
    expect(user.username).toBe('Test User');
    expect(user.preset).toBeUndefined();
  });

  it('returns null when user is not found', () => {
    expect(getUser('missing@example.com')).toBeNull();
  });
});

describe('isValidUser', () => {
  it('returns true for valid preset credentials', () => {
    expect(isValidUser('clark@example.com', 'password')).toBe(true);
  });

  it('returns false for invalid credentials', () => {
    expect(isValidUser('clark@example.com', 'wrong')).toBe(false);
    expect(isValidUser('missing@example.com', 'password')).toBeFalsy();
  });
});

describe('session cookie helpers', () => {
  it('stores and reads session cookie', () => {
    login('user@example.com');
    expect(getSessionUser()).toBe('user@example.com');
    logout();
    expect(getSessionUser()).toBe('');
  });

  it('stores and deletes transaction cookie', () => {
    document.cookie = 'transaction=abc123';
    expect(getTransactionId()).toBe('abc123');
    deleteTransactionId();
    expect(getTransactionId()).toBe('');
  });
});

describe('genTransactionId', () => {
  it('returns a 10-digit numeric string', () => {
    const id = genTransactionId();
    expect(id).toMatch(/^\d{10}$/);
    expect(Number(id)).toBeGreaterThanOrEqual(1_000_000_000);
    expect(Number(id)).toBeLessThan(10_000_000_000);
  });
});

describe('redirectToTop', () => {
  it('redirects from locale root html to index', () => {
    setLocation('/en-US/login.html');
    redirectToTop();
    expect(getAssignMock()).toHaveBeenCalledWith(
      'http://localhost:8080/en-US/index.html',
    );
  });

  it('redirects from root-level html to index', () => {
    setLocation('/index.html');
    redirectToTop();
    expect(getAssignMock()).toHaveBeenCalledWith(
      'http://localhost:8080/index.html',
    );
  });

  it('redirects from nested path to locale index', () => {
    setLocation('/ja/rooms/single.html');
    redirectToTop();
    expect(getAssignMock()).toHaveBeenCalledWith(
      'http://localhost:8080/ja/rooms/index.html',
    );
  });
});

describe('setLoginNavbar', () => {
  it('toggles navbar visibility and wires logout', () => {
    document.body.innerHTML = navbarHtml;
    setLoginNavbar();
    expect($('#signup-holder').hasClass('d-none')).toBe(true);
    expect($('#login-holder').hasClass('d-none')).toBe(true);
    expect($('#mypage-holder').hasClass('d-block')).toBe(true);
    expect($('#logout-holder').hasClass('d-block')).toBe(true);

    login('user@example.com');
    $('#logout-form').trigger('submit');
    expect(getSessionUser()).toBe('');
  });
});

describe('property-based', () => {
  it('genTransactionId always returns a 10-digit numeric string in range', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const id = genTransactionId();
        expect(id).toMatch(/^\d{10}$/);
        expect(Number(id)).toBeGreaterThanOrEqual(1_000_000_000);
        expect(Number(id)).toBeLessThan(10_000_000_000);
      }),
      pbtOptions,
    );
  });

  it('canDisplayPlan matches premium membership rules', () => {
    fc.assert(
      fc.property(
        fc.record({
          only: fc.constantFrom('premium', 'member', 'other'),
          rank: fc.constantFrom('premium', 'normal', 'member'),
        }),
        ({ only, rank }) => {
          const user = { rank };
          const result = canDisplayPlan({ only }, user);
          if (only === 'premium') {
            expect(result).toBe(rank === 'premium');
          } else if (only === 'member') {
            expect(result).toBe(true);
          } else {
            expect(result).toBeUndefined();
          }
        },
      ),
      pbtOptions,
    );
  });
});
