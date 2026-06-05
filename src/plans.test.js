import { describe, expect, it } from 'vitest';
import { mountHtml, plansPageHtml } from '../test/helpers/dom-fixtures.js';
import { loadPageScript } from '../test/helpers/page-loader.js';
import { login } from './lib/session.js';

describe('plans.js', () => {
  it('renders visible plans for guests', async () => {
    mountHtml(plansPageHtml);
    await loadPageScript('plans.js');
    expect($('#plan-list').html()).toContain('Staying without meals');
    expect($('#plan-list').html()).not.toContain('Plan with special offers');
  });

  it('renders member-only plans for logged-in users', async () => {
    mountHtml(plansPageHtml);
    login('diana@example.com');
    await loadPageScript('plans.js');
    expect($('#plan-list').html()).toContain('With dinner');
  });

  it('renders premium badge for premium-only plans', async () => {
    mountHtml(plansPageHtml);
    login('clark@example.com');
    await loadPageScript('plans.js');
    expect($('#plan-list').html()).toContain('members ONLY');
    expect($('#plan-list').html()).toContain('Premium plan');
  });

  it('shows logged-in navbar when session exists', async () => {
    mountHtml(plansPageHtml);
    login('clark@example.com');
    await loadPageScript('plans.js');
    expect($('#mypage-holder').hasClass('d-block')).toBe(true);
    expect($('#signup-holder').hasClass('d-none')).toBe(true);
  });
});
