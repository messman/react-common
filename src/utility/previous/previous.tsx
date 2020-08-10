import * as React from 'react';

// from https://usehooks.com/usePrevious/
/**
 * Returns the previous distinct value. Safe across multiple re-renders.
 * Not the same as returning the value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
	// Keep up to date with the value.
	const previousValueRef = React.useRef<T | undefined>(undefined);
	// Keep up to date with the previous value.
	const valueRef = React.useRef<T | undefined>(undefined);

	React.useEffect(() => {
		previousValueRef.current = valueRef.current;
		valueRef.current = value;
	}, [value]);

	// If value hasn't changed, use the previous ref. If value has changed, use the more current ref.
	return Object.is(value, valueRef.current) ? previousValueRef.current : valueRef.current;
}