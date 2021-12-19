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

/**
 * Returns a function that can be used to trigger hidden state, causing the component to run again.
 * The provided callback will be called in an effect after this render, and thus will always
 * have the most updated state and props (unless memoized).
 * 
 * Useful in cases where an asynchronous task (fetch, timer) needs to take action with the most recent
 * props and state.
*/
export function useEventCallback<T>(callback: (data: T) => void): (data: T) => void {
	// Use a queue, in case multiple callbacks are scheduled in a single phase.
	const [queue, setQueue] = React.useState<T[]>([]);

	React.useEffect(() => {
		// This is essentially our 'key' to indicate whether the code below should run.
		if (queue.length === 0) {
			return;
		}
		for (let i = 0; i < queue.length; i++) {
			callback(queue[i]);
		}
		setQueue([]);
	}, [queue, callback]);

	return function (data) {
		setQueue((q) => {
			return [...q, data];
		});
	};
}