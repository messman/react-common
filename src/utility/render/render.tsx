import * as React from 'react';

/*
	Safe to use, but there are other ways to set up your code that might be more sensible / easy to follow
	(see https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
	Essentially, treat your effects less like callbacks. 
*/
/**
 * Anti-pattern.
 * "Lifts" a value up to make the latest version always available to use in an effect.
 * Use sparingly to get out of complicated scenarios.
 * Uses useEffect, not useLayoutEffect.
 * @param value - The value to keep. Triggers the effect.
 */
export function useLatestForEffect<T>(value: T): React.MutableRefObject<T> {
	const valueRef = React.useRef<T>(value);

	React.useEffect(() => {
		valueRef.current = value;
	}, [value]);

	return valueRef;
}

/**
 * Anti-pattern.
 * "Lifts" a value up to make the latest version always available to use in an effect.
 * Use sparingly to get out of complicated scenarios.
 * Uses useEffect, not useLayoutEffect.
 */
export function useLatestForLayoutEffect<T>(value: T): React.MutableRefObject<T> {
	const valueRef = React.useRef<T>(value);

	React.useLayoutEffect(() => {
		valueRef.current = value;
	}, [value]);

	return valueRef;
}

/*
	Like useEffect, but doesn't run on that first time.
	// https://stackoverflow.com/questions/53253940/make-react-useeffect-hook-not-run-on-initial-render
*/
/**
 * Anti-pattern.
 * An effect that will not run the first time - it only runs on dependency changes.
 * Use sparingly to get out of complicated scenarios.
 * Will not work with useLayoutEffect callbacks.
 */
export function useChangeEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
	const isFirstRender = React.useRef(true);

	React.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		return effect();
	}, deps);
}