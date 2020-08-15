import * as React from 'react';
import { useLatestForEffect } from '@/utility/render/render';

export interface TruthyTimerInitialInput {
	isStarted: boolean;
	timeout: number;
}

export interface TruthyTimerResetInput {
	isStarted: boolean;
	timeout?: number;
}

interface TruthyTimerState extends TruthyTimerInitialInput {
	startedAt: number;
}

export interface TruthyTimerOutput extends TruthyTimerState {
	isTruthy: boolean,
	reset: (args: TruthyTimerResetInput) => void;
}

function noop() { }
/**
 * Creates a timer with setTimeout. The timer callback will only trigger when the timer completes and the argument is truthy.
 * When combined with a boolean for document visibility (document.hidden), this timer will persist across minimization, switched tabs, etc.
 * Returns an output object with state and reset functions.
 * Callback can return an object to indicate new state of the timer.
 */
export function useTruthyTimer(initialArgs: TruthyTimerInitialInput, isTruthy: boolean, callback?: () => (TruthyTimerResetInput | void)): TruthyTimerOutput {

	const [state, setState] = React.useState<TruthyTimerState>(() => {
		return {
			isStarted: initialArgs.isStarted,
			timeout: initialArgs.timeout,
			startedAt: initialArgs.isStarted ? Date.now() : -1
		};
	});

	const { isStarted, startedAt, timeout } = state;

	/*
		Sure, we could always restart the timer when the callback changes, but that would break down the precision of the timer.
		So for this special case, always hold the most recent version of the callback just to use at the end.
	*/
	const latestCallback = useLatestForEffect(callback || noop);

	// We only need to have the timeout running when we are both started and truthy.
	const isStartedInternalTimer = isStarted && isTruthy;

	React.useEffect(() => {
		let timeoutId = -1;
		if (isStartedInternalTimer) {
			const timeElapsed = Date.now() - startedAt;
			const timeRemaining = Math.max(timeout - timeElapsed, 0);

			function onTimeoutComplete() {
				let newIsStarted = false;
				let newTimeout = timeout;
				if (latestCallback.current) {
					const args = latestCallback.current();
					if (args) {
						newIsStarted = args.isStarted;
						newTimeout = args.timeout || newTimeout;
					}
				}
				setState((p) => {
					return {
						isStarted: newIsStarted,
						timeout: newTimeout,
						startedAt: newIsStarted ? Date.now() : p.startedAt
					};
				});
			}

			if (timeRemaining === 0) {
				onTimeoutComplete();
			}
			else {
				timeoutId = window.setTimeout(onTimeoutComplete, timeRemaining);
			}
		}

		return () => {
			// Cleanup
			window.clearTimeout(timeoutId);
		};
	}, [isStartedInternalTimer, timeout, startedAt]);

	return React.useMemo<TruthyTimerOutput>(() => {
		function reset(args: TruthyTimerResetInput) {

			setState((p) => {
				return {
					isStarted: args.isStarted,
					timeout: args.timeout || p.timeout,
					startedAt: args.isStarted ? Date.now() : p.startedAt
				};
			});
		}

		return {
			isTruthy: isTruthy,
			isStarted: isStarted,
			timeout: timeout,
			startedAt: startedAt,
			reset: reset
		};
	}, [isStarted, timeout, startedAt, isTruthy]);
}

export function getDebugTruthyTimerStatus(truthyTimerOutput: TruthyTimerOutput) {
	const { isStarted, timeout, isTruthy, startedAt } = truthyTimerOutput;

	const startedText = isStarted ? 'started' : 'idle';
	const startedAtText = (isStarted && startedAt > 0) ? ` (${(new Date(startedAt)).toLocaleTimeString([], { hour12: false })}.${(startedAt % 1000).toPrecision(3)})` : '';
	const timeoutText = (isStarted && !!timeout) ? ` (${timeout}ms)` : '';
	const truthyText = (isStarted && isTruthy !== undefined) ? ` (${isTruthy ? 'truthy' : 'falsy'})` : '';
	return startedText + startedAtText + timeoutText + truthyText;
}