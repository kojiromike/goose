import { useRef } from 'react';

/**
 * Returns `value` as it was when `frozen` last turned true, and the live value
 * otherwise. Lets a list hold still under an open menu while its data keeps
 * changing, then catch up in one step when the menu closes.
 */
export function useFrozenWhile<T>(value: T, frozen: boolean): T {
  const snapshot = useRef(value);
  if (!frozen) snapshot.current = value;
  return snapshot.current;
}
