import * as React from 'react';
import { useLatest } from '@/utility/render/render';


export function usePromise<T>(isRunning: boolean, promiseFunc: () => Promise<T>, callback: (data: T | null, error: Error | null) => void, restartOn?: any[]) {

	/*
		The callback could change every render, and we don't know when the promise will finish.
		So for this special case, always hold the most recent version of the callback just to use at the end.
	*/
	const latestCallback = useLatest(callback);

	restartOn = restartOn || [];

	// This effect runs like a change callback. I could not find a way around it.
	React.useEffect(() => {
		if (!isRunning) {
			return;
		}
		let isCleanedUp = false;

		promiseFunc()
			.then((resp: T) => {
				if (!isCleanedUp) {
					latestCallback.current(resp, null);
				}
			})
			.catch((err: Error) => {
				if (!isCleanedUp) {
					latestCallback.current(null, err);
				}
			});

		return () => {
			// Cleanup
			isCleanedUp = true;
		};

	}, [isRunning, promiseFunc, ...restartOn]);
}

interface ControlledPromiseState {
	/** If true, promise is in progress. */
	isRunning: boolean;
	runCounter: number;
}

export interface ControlledPromiseOutput {
	isRunning: boolean;
	/** Updates the initial inputs to the promise hook. Abandons any running promise. */
	reset: (run: boolean) => void;
}

/**
 * Controls a promise with a set of functions.
*/
export function useControlledPromise<T>(isRunningInitially: boolean, promiseFunc: () => Promise<T>, callback?: (data: T | null, error: Error | null) => boolean): ControlledPromiseOutput {

	const [state, setState] = React.useState<ControlledPromiseState>({
		isRunning: isRunningInitially,
		runCounter: 0
	});

	function updateOnReset(run: boolean) {
		setState((p) => {
			return {
				isRunning: run,
				runCounter: run ? p.runCounter + 1 : p.runCounter
			};
		});
	}

	usePromise<T>(state.isRunning, promiseFunc, (data, error) => {
		let rerun = false;
		if (callback) {
			rerun = callback(data, error);
		}
		updateOnReset(rerun);
	}, [state.runCounter]);

	return React.useMemo<ControlledPromiseOutput>(() => {
		function reset(run: boolean) {
			updateOnReset(run);
		}

		return {
			isRunning: state.isRunning,
			reset: reset
		};
	}, [state]);
}

interface DataControlledPromiseState<T> {
	data: T | null;
	error: Error | null;
}

interface DataControlledPromiseCallbackInput {
	run: boolean;
	clear?: boolean;
}


export interface DataControlledPromiseOutput<T> {
	isRunning: boolean;
	data: T | null;
	error: Error | null;
	/** Updates the initial inputs to the promise hook. Abandons any running promise. */
	reset: (input: DataControlledPromiseCallbackInput) => void;
}

/**
 * Controls a promise with a set of functions.
*/
export function useDataControlledPromise<T>(isRunningInitially: boolean, promiseFunc: () => Promise<T>, callback?: (data: T | null, error: Error | null) => DataControlledPromiseCallbackInput): DataControlledPromiseOutput<T> {

	const [state, setState] = React.useState<DataControlledPromiseState<T>>({
		data: null,
		error: null
	});

	const controlledPromise = useControlledPromise(isRunningInitially, promiseFunc, (data, error) => {
		let rerun = false;
		let clear = false;
		if (callback) {
			const callbackInput = callback(data, error);
			rerun = callbackInput.run;
			clear = !!callbackInput.clear;
		}

		const dataToSet = clear ? null : data;
		const errorToSet = clear ? null : error;

		setState((p) => {
			if (p.data === dataToSet && p.error === errorToSet) {
				return p;
			}
			return {
				data: dataToSet,
				error: errorToSet
			};
		});
		return rerun;
	});

	const isRunning = controlledPromise.isRunning;
	const innerReset = controlledPromise.reset;

	return React.useMemo<DataControlledPromiseOutput<T>>(() => {
		function reset(input: DataControlledPromiseCallbackInput) {
			const { run, clear } = input;

			if (clear) {
				setState((p) => {
					if (!p.data && !p.error) {
						return p;
					}
					return {
						data: null,
						error: null
					};
				});
			}
			innerReset(run);
		}

		return {
			isRunning: isRunning,
			data: state.data,
			error: state.error,
			reset: reset
		};
	}, [state, isRunning, innerReset]);
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