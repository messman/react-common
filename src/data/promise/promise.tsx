import * as React from 'react';
import { useLatestForEffect } from '@/utility/render/render';

/**
 * Runs a promise.
 * Any change to any inputs will re-run the promise - so memoize inputs as needed!
 */
export function usePromise<T>(isRunning: boolean, promiseFunc: () => Promise<T>, callback: (data: T | null, error: Error | null) => void) {
	// This effect runs like a change callback. I could not find a way around it.
	React.useEffect(() => {
		if (!isRunning || !promiseFunc || !callback) {
			return;
		}
		let isCleanedUp = false;

		promiseFunc()
			.then((resp: T) => {
				if (!isCleanedUp) {
					callback(resp, null);
				}
			})
			.catch((err: Error) => {
				if (!isCleanedUp) {
					callback(null, err);
				}
			});

		return () => {
			// Cleanup
			isCleanedUp = true;
		};

	}, [isRunning, promiseFunc, callback]);
}

/** Initial input to the Promise hook. */
export interface PromiseInitialInput<T> {
	/** If true, promise will start. */
	isStarted: boolean;
	/** A function that returns a promise. */
	promiseFunc: () => Promise<T>;
	/** Data to be stored (and eventually replaced) as the successful result of the promise. */
	data?: T | null;
	/** An error to be stored (and eventually replaced) as the error result of the promise. */
	error?: Error | null;
}

export interface PromiseResetInput<T> {
	/** Whether the promise should restart. */
	isStarted: boolean;
	/** If provided, a new promise function. Else, the existing promise function is used. */
	promiseFunc?: () => Promise<T>;
	/** If provided, the data to store as the result of the promise. Else, the outcome of the promise is used. */
	data?: T | null;
	/** If provided, the error to store as the result of the promise. Else, the outcome of the promise is used. */
	error?: Error | null;
}

export interface PromiseState<T> extends PromiseInitialInput<T> {
	/** When the promise was last started. */
	startedAt: number;
	/** Data stored from the last promise completion. May be reset. */
	data: T | null;
	/** Error stored from the last promise completion. May be reset. */
	error: Error | null;
}

export interface PromiseOutput<T> extends Omit<PromiseState<T>, 'promiseFunc'> {
	/** Clears the data and error stored in state. Does not affect the current promise. */
	clearResults: () => void;
	/** Abandons the running promise and supplies a new state. */
	reset: (args: PromiseResetInput<T>) => void;
}

/**
 * Runs a promise function. Executes a callback when complete. The most recent callback from the most recent render is always used.
 * The callback, if supplied, returns a boolean indicating if the promise should run again. If not supplied, the promise will become idle.
 * Returns a function to use to reset the promise.
 * @param initialInput - Locked - Changes will not change state
 * @param callback - Live - Changes will not change state
*/
export function usePromiseState<T>(initialInput: PromiseInitialInput<T>, callback?: (data: T | null, error: Error | null) => PromiseResetInput<T>): PromiseOutput<T> {

	const [state, setState] = React.useState<PromiseState<T>>(() => {
		return {
			isStarted: initialInput.isStarted,
			promiseFunc: initialInput.promiseFunc,
			data: initialInput.data || null,
			error: initialInput.error || null,
			startedAt: initialInput.isStarted ? Date.now() : -1
		};
	});

	const { isStarted, promiseFunc, startedAt, data, error } = state;

	const savedCallback = useLatestForEffect(callback);

	const promiseCallback = React.useCallback((data: T | null, error: Error | null) => {
		let newIsStarted = false;
		let newPromiseFunc: (() => Promise<T>) | undefined = undefined;
		if (savedCallback.current) {
			const resetInput = savedCallback.current(data, error);
			if (resetInput) {
				newIsStarted = resetInput.isStarted;
				newPromiseFunc = resetInput.promiseFunc;
				data = resetInput.data !== undefined ? resetInput.data : data;
				error = resetInput.error !== undefined ? resetInput.error : error;
			}
		}
		setState((p) => {
			return {
				isStarted: newIsStarted,
				promiseFunc: newPromiseFunc !== undefined ? newPromiseFunc : p.promiseFunc,
				data: data,
				error: error,
				startedAt: newIsStarted ? Date.now() : p.startedAt
			};
		});
		// Trigger re-run on startedAt.
	}, [startedAt]);

	usePromise<T>(isStarted, promiseFunc, promiseCallback);

	return React.useMemo<PromiseOutput<T>>(() => {

		function clearResults() {
			setState((p) => {
				return {
					...p,
					data: null,
					error: null
				};
			});
		}

		function reset(resetInput: PromiseResetInput<T>) {
			setState((p) => {
				return {
					isStarted: resetInput.isStarted,
					promiseFunc: resetInput.promiseFunc !== undefined ? resetInput.promiseFunc : p.promiseFunc,
					data: resetInput.data !== undefined ? resetInput.data : p.data,
					error: resetInput.error !== undefined ? resetInput.error : p.error,
					startedAt: resetInput.isStarted ? Date.now() : p.startedAt
				};
			});
		}

		return {
			isStarted: isStarted,
			startedAt: startedAt,
			data: data,
			error: error,
			clearResults: clearResults,
			reset: reset
		};
	}, [isStarted, promiseFunc, startedAt, data, error]);
}

export function getDebugPromiseStatus<T>(promiseOutput: PromiseOutput<T>): string {
	const { isStarted, data, error, startedAt } = promiseOutput;

	const startedText = isStarted ? 'started' : 'idle';
	const startedAtText = (isStarted && startedAt > 0) ? ` (${(new Date(startedAt)).toLocaleTimeString([], { hour12: false })}.${(startedAt % 1000).toPrecision(3)})` : '';
	const dataText = data ? ' (data)' : '';
	let errorText = '';
	if (error) {
		errorText = error.message === clampPromiseMaximumTimeoutReason ? ' (error: Timed Out)' : ' (error)';
	}
	return startedText + startedAtText + dataText + errorText;
}

/** Can be compared to the message of the result error of a clamped promise to tell if the promise hit the maximum timeout. */
export const clampPromiseMaximumTimeoutReason = '__promise-timed-out__';

/**
 * Allows for a minimum and maximum time to be applied to a promise.
 * Returns a new promise each time it is called.
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