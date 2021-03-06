import * as React from 'react';

// REQUIRED: must use relative paths here, since we are exporting types from other files.
// If we used '@/...' here, it would show as '@/...' in the output .d.ts files.
import { usePromiseState, PromiseOutput } from '../data/promise/promise';
import { useTruthyTimer, TruthyTimerOutput } from '../lifecycle/timer/timer';

/** Components used with the Stale Promise Timer. */
export enum StalePromiseTimerComponent {
	/** No component. Default. */
	none,
	/** The timer. */
	timer,
	/** The promise. */
	promise
}

/** Inputs to the hook. Provided as an object because there are so many. */
export interface StalePromiseTimerInput<T> {
	/** What should the initial state of this promise timer be? */
	initialAction: StalePromiseTimerComponent;

	/** Timeout to use with the timer. */
	timerTimeout: number,
	/** Whether the timer is truthy, meaning whether it can indicate it is completed. */
	isTimerTruthy: boolean;
	/** Callback to run when the timer completes. Does not need to reset the timer - this is done automatically. */
	timerCallback?: () => void;

	/** Promise function to be run. */
	promiseFunc: () => Promise<T>;
	/** Callback to run when the promise completes. Does not need to reset the promise - this is done automatically. */
	promiseCallback?: (data: T | null, error: Error | null) => void;
}

/** Outputs from the hook, used to set the UI and move between states. */
export interface StalePromiseTimerOutput<T> {
	/** Contains ways to restart or end the timer. */
	timer: TruthyTimerOutput;
	/** Contains ways to restart or end the promise. */
	promise: PromiseOutput<T>;
	/** The last completed component - timer, promise, or neither. */
	lastCompleted: StalePromiseTimerComponent;
}

/**
 * Combines a promise hook with a timer hook to address promise data that may be stale over time, like fetched data on a page that is not often refreshed (mobile web apps).
 */
export function useStalePromiseTimer<T>(input: StalePromiseTimerInput<T>): StalePromiseTimerOutput<T> {

	const { initialAction, timerTimeout, isTimerTruthy, timerCallback, promiseFunc, promiseCallback } = input;

	const isTimerStartedInitially = initialAction === StalePromiseTimerComponent.timer;
	const isPromiseRunningInitially = initialAction === StalePromiseTimerComponent.promise;
	const [lastCompletedComponent, setLastCompletedComponent] = React.useState<StalePromiseTimerComponent>(StalePromiseTimerComponent.none);

	const timerOutput = useTruthyTimer({
		isStarted: isTimerStartedInitially,
		timeout: timerTimeout
	}, isTimerTruthy, () => {

		setLastCompletedComponent(() => {
			return StalePromiseTimerComponent.timer;
		});
		if (timerCallback) {
			timerCallback();
		}

		return {
			isStarted: false
		};
	});
	const promiseOutput = usePromiseState({
		isStarted: isPromiseRunningInitially,
		promiseFunc: promiseFunc
	}, (data, error) => {

		setLastCompletedComponent(() => {
			return StalePromiseTimerComponent.promise;
		});
		if (promiseCallback) {
			promiseCallback(data, error);
		}

		return {
			isStarted: false
		};
	});

	return React.useMemo<StalePromiseTimerOutput<T>>(() => {
		return {
			timer: timerOutput,
			promise: promiseOutput,
			lastCompleted: lastCompletedComponent
		};
	}, [timerOutput, promiseOutput, lastCompletedComponent]);
}