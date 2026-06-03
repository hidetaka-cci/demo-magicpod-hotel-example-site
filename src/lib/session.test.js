import { describe, expect, it } from 'vitest';
import { canDisplayPlan } from './session.js';

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
});
