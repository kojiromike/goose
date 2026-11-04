import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFrozenWhile } from './useFrozenWhile';

describe('useFrozenWhile', () => {
  it('follows the value while not frozen', () => {
    const { result, rerender } = renderHook(({ value }) => useFrozenWhile(value, false), {
      initialProps: { value: ['a', 'b'] },
    });
    rerender({ value: ['b', 'a'] });
    expect(result.current).toEqual(['b', 'a']);
  });

  it('holds the value from when it froze, then catches up on thaw', () => {
    const { result, rerender } = renderHook(({ value, frozen }) => useFrozenWhile(value, frozen), {
      initialProps: { value: ['a', 'b'], frozen: false },
    });
    rerender({ value: ['a', 'b'], frozen: true });
    rerender({ value: ['b', 'a'], frozen: true });
    rerender({ value: ['c', 'b', 'a'], frozen: true });
    expect(result.current).toEqual(['a', 'b']);

    rerender({ value: ['c', 'b', 'a'], frozen: false });
    expect(result.current).toEqual(['c', 'b', 'a']);
  });
});
