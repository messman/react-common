import * as React from 'react';
import { useLatest } from '@/utility/render/render';


export function useTruthyTimer(isStarted: boolean, timeout: number, isTruthy: boolean, callback: () => void, restartOn?: any[]): void {

	/*
		Sure, we could always restart the timer when the callback changes, but that would break down the precision of the timer.
		So for this special case, always hold the most recent version of the callback just to use at the end.
	*/
	const latestCallback = useLatest(callback);

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

export interface TruthyTimerInitialInput {
	start: boolean;
	timeout: number;
}

export interface TruthyTimerState {
	isStarted: boolean;
	timeout: number;
	startCounter: number;
}

export interface TruthyTimerCallbackInput {
	start: boolean;
	timeout?: number;
}

export interface TruthyTimerOutput {
	isStarted: boolean;
	timeout: number;
	stop: () => void;
	restart: (timeout?: number) => void;
}

export function useControlledTruthyTimer(initialInput: TruthyTimerInitialInput, isTruthy: boolean, callback?: () => TruthyTimerInitialInput): TruthyTimerOutput {

	const [state, setState] = React.useState<TruthyTimerState>(() => {
		return {
			isStarted: initialInput.start,
			timeout: initialInput.timeout,
			startCounter: 0
		};
	});

	useTruthyTimer(state.isStarted, state.timeout, isTruthy, () => {
		let newInput: TruthyTimerCallbackInput = {
			start: false
		};
		if (callback) {
			newInput = callback();
		}

		setState((p) => {
			return {
				isStarted: newInput.start,
				timeout: newInput.timeout || p.timeout,
				startCounter: newInput.start ? p.startCounter + 1 : p.startCounter
			};
		});
	}, [state.startCounter]);

	return React.useMemo<TruthyTimerOutput>(() => {
		function stop() {
			setState((p) => {
				if (!p.isStarted) {
					return p;
				}

				return {
					isStarted: false,
					timeout: p.timeout,
					startCounter: p.startCounter
				};
			});
		}

		function restart(timeout?: number) {
			setState((p) => {
				return {
					isStarted: false,
					timeout: timeout === undefined ? p.timeout : timeout,
					startCounter: p.startCounter + 1
				};
			});
		}

		return {
			isStarted: state.isStarted,
			timeout: state.timeout,
			stop: stop,
			restart: restart
		};
	}, [state]);
}