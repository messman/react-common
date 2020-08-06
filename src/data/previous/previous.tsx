import * as React from 'react';

// from https://usehooks.com/usePrevious/
/**
 * Returns the previous distinct value. Safe across multiple re-renders.
 */
export function usePrevious<T>(value: T): [T | undefined, () => void] {
	const currentValue = React.useRef<T | undefined>(undefined);
	const previousValue = React.useRef<T | undefined>(undefined);

	function clearRef() {
		currentValue.current = undefined;
		previousValue.current = undefined;
	}

	if (!Object.is(value, currentValue.current)) {
		previousValue.current = currentValue.current;
		currentValue.current = value;
	}

	return [previousValue.current, clearRef];
}