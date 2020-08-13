import * as React from 'react';
import { useLatestForEffect } from '@/utility/render/render';

/**
 * Creates a timer with setTimeout. The timer callback will only trigger when the timer completes and the argument is truthy.
 * When combined with a boolean for document visibility (document.hidden), this timer will persist across minimization, switched tabs, etc.
 * Callback should change inputs such that timer will either restart or be turned off.
 */
export function useTruthyTimer(isStarted: boolean, timeout: number, isTruthy: boolean, callback: () => void, restartOn?: any[]): void {

	/*
		Sure, we could always restart the timer when the callback changes, but that would break down the precision of the timer.
		So for this special case, always hold the most recent version of the callback just to use at the end.
	*/
	const latestCallback = useLatestForEffect(callback);

	// We only need to have the timeout running when we are both started and truthy.
	const isStartedInternalTimer = isStarted && isTruthy;

	restartOn = restartOn || [];

	// Tracks the most recent start time.
	const timerStartedAt = React.useRef<number | null>(null);
	// This effect runs like a change callback. I could not find a way around it.
	React.useEffect(() => {
		timerStartedAt.current = isStarted ? Date.now() : null;
	}, [isStarted, timeout, ...restartOn]);

	React.useEffect(() => {

		let timeoutId = -1;
		if (isStartedInternalTimer) {
			const timeElapsed = timerStartedAt.current ? Date.now() - timerStartedAt.current : 0;
			const realTimeout = Math.max(timeout - timeElapsed, 0);
			timeoutId = window.setTimeout(() => {
				latestCallback.current();
			}, realTimeout);
		}

		return () => {
			// Cleanup
			window.clearTimeout(timeoutId);
		};
	}, [isStartedInternalTimer, timeout, ...restartOn]);
}


interface ControlledTruthyTimerState {
	isStarted: boolean;
	startCounter: number;
}

export interface ControlledTruthyTimerOutput {
	isStarted: boolean;
	reset: (start: boolean) => void;
}

/**
 * Creates a timer with setTimeout. The timer callback will only trigger when the timer completes and the argument is truthy.
 * When combined with a boolean for document visibility (document.hidden), this timer will persist across minimization, switched tabs, etc.
 * Callback, if supplied, should return a boolean to indicate whether to run the timer again.
 * Returns functions for resetting the timer.
 */
export function useControlledTruthyTimer(isStartedInitially: boolean, timeout: number, isTruthy: boolean, callback?: () => boolean): ControlledTruthyTimerOutput {

	const [state, setState] = React.useState<ControlledTruthyTimerState>({
		isStarted: isStartedInitially,
		startCounter: 0
	});

	useTruthyTimer(state.isStarted, timeout, isTruthy, () => {
		let restart = false;
		if (callback) {
			restart = callback();
		}

		setState((p) => {
			return {
				isStarted: restart,
				startCounter: restart ? p.startCounter + 1 : p.startCounter
			};
		});
	}, [state.startCounter]);

	return React.useMemo<ControlledTruthyTimerOutput>(() => {
		function reset(start: boolean) {
			setState((p) => {
				if (!p.isStarted && !start) {
					return p;
				}
				return {
					isStarted: start,
					startCounter: start ? p.startCounter + 1 : p.startCounter
				};
			});
		}

		return {
			isStarted: state.isStarted,
			reset: reset
		};
	}, [state]);
}