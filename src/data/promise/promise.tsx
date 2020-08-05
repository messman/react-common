import * as React from 'react';

export interface PromiseInput<T> {
	/** Promise to be run. Output should not be null. */
	promiseFunc: () => Promise<T>;
	/** If true, runs the promise immediately on first invocation. */
	runImmediately: boolean;
}

export interface PromiseState<T> {
	/** Initially-supplied promise function. Output should not be null. */
	promiseFunc: () => Promise<T>;
	/** If true, promise is in progress. */
	isRunning: boolean;
	/** If not null, promise is completed successfully. */
	data: T | null;
	/** If not null, promise encountered an error. */
	error: Error | null;
}

export interface PromiseReset<T> extends PromiseInput<T> {
	/** If true, will clear existing state. */
	clearExistingState: boolean;
}

export interface PromiseOutput<T> extends PromiseState<T> {
	/** Updates the initial inputs to the promise hook. Abandons any running promise. */
	reset: (input: Partial<PromiseReset<T>>) => void;
}

/**
 * Controls a promise with a set of functions.
*/
export function usePromise<T>(input: PromiseInput<T> | (() => PromiseInput<T>)): PromiseOutput<T> {

	// The below function only runs the first time.
	const [state, setState] = React.useState<PromiseOutput<T>>(() => {

		// This private function will supply any new promise, isRunning value, etc.
		function reset(newInput: Partial<PromiseReset<T>>): void {
			// Disconnect from any running promise.
			currentPromise.current = null;
			const runImmediately = newInput.runImmediately || false;
			// Controls whether we should run.
			runFirstTime.current = runImmediately;
			setState((p) => {
				// Will always force an update - and that's what we want, since we want to run if that's the case.
				return {
					...p,
					promiseFunc: newInput.promiseFunc || p.promiseFunc,
					isRunning: runImmediately,
					data: newInput.clearExistingState ? null : p.data,
					error: newInput.clearExistingState ? null : p.error
				};
			});
		}

		const actualInput = input instanceof Function ? input() : input;
		return {
			promiseFunc: actualInput.promiseFunc,
			isRunning: actualInput.runImmediately,
			data: null,
			error: null,
			reset: reset,
		};
	});

	// Hold our current promise as a way to guard against older promises that complete for newer promises.
	const currentPromise = React.useRef<Promise<T> | null>(null);

	React.useEffect(() => {
		// When this hook is destroyed, abandon the promise.
		return () => {
			currentPromise.current = null;
		};
	}, []);

	// Run the first time if told to do so.
	// This also controls running after a state update.
	const runFirstTime = React.useRef(state.isRunning);
	if (runFirstTime.current) {
		runFirstTime.current = false;

		function wrapFinish(data: T | null, error: Error | null): void {
			// If this is from an old promise, disregard.
			if (currentPromise.current !== promise) {
				return;
			}
			setState((p) => {
				return {
					...p,
					promiseFunc: state.promiseFunc,
					isRunning: false,
					data: data,
					error: error
				};
			});
		}

		const promise = state.promiseFunc();
		currentPromise.current = promise;
		promise
			.then((resp) => {
				wrapFinish(resp, null);
			})
			.catch((err: Error) => {
				wrapFinish(null, err);
			});
	}

	return state;
}

export const clampPromiseMaximumTimeoutReason = '__promise-timed-out__';

/**
 * Allows for a minimum and maximum time to be applied to a promise.
 * Returns a new promise every time.
 */
export function clampPromise<T>(promise: Promise<T>, minMilliseconds: number | null, maxMilliseconds: number | null): Promise<T> {

	return new Promise<T>((resolve, reject) => {

		const startTime = Date.now();
		let didReachMaximum = false;
		let timeoutId = -1;
		if (maxMilliseconds != null) {
			timeoutId = window.setTimeout(() => {
				didReachMaximum = true;
				reject(new Error(clampPromiseMaximumTimeoutReason));
			}, maxMilliseconds);
		}

		function onFinish(res: T | null, err: any | null): void {
			if (didReachMaximum) {
				return;
			}

			if (timeoutId !== -1) {
				window.clearTimeout(timeoutId);
			}

			// Apply our minimum time.
			const minTimeRemaining = Math.max(0, (minMilliseconds || 0) - (Date.now() - startTime));

			function finish(): void {
				if (res) {
					resolve(res);
				}
				else {
					reject(err);
				}
			}

			if (minTimeRemaining > 0) {
				window.setTimeout(finish, minTimeRemaining);
			}
			else {
				finish();
			}
		}

		promise.then(
			(res) => {
				onFinish(res, null);
			},
			(err) => {
				onFinish(null, err);
			}
		);
	});
}