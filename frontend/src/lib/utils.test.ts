import { describe, expect, it } from 'vitest';
import { cn, initials, ordinal } from './utils';

describe('utils', () => {
  it('cn merges and dedupes tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold');
  });

  it('initials builds uppercase initials with a fallback', () => {
    expect(initials('Lionel', 'Messi')).toBe('LM');
    expect(initials()).toBe('⚽');
  });

  it('ordinal formats positions', () => {
    expect(ordinal(1)).toBe('1°');
  });
});
