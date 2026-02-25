import { describe, expect, it } from 'vitest';
import { isDesktopNavActive } from './nav-state';

describe('isDesktopNavActive', function () {
  it('returns true when paths match', function () {
    expect(isDesktopNavActive('/career', '/career')).toBe(true);
  });

  it('returns false when paths differ', function () {
    expect(isDesktopNavActive('/dashboard', '/settings')).toBe(false);
  });
});
