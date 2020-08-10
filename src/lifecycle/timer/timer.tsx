import * as React from 'react';
import { useDocumentVisibility } from '../visibility/visibility';

export interface PassiveTimerInput {
	expiration: number;
	start: boolean;
}

export interface PassiveTimerState {
	isStarted: boolean;
	lastStartedAt: number | null;
	lastFinishedAt: number | null;
}

export interface PassiveTimerOutput extends PassiveTimerState {
	stop: () => void;
	restart: (expiration?: number) => void;
}

export function usePassiveTimer(input: PassiveTimerInput, isPassive: boolean) {

	// Tracks timer expiration provided from outside.
	const timerExpiration = React.useRef(input.expiration);

	// First-time setup of state.
	const [state, setState] = React.useState<PassiveTimerState>(() => {
		return {
			isStarted: input.start,
			lastStartedAt: input.start ? Date.now() : null,
			lastFinishedAt: null
		};
	});

	// Tracks the timeout for cancellation.
	const timeoutId = React.useRef(-1);

	// Function is safe to reuse because it only deals with refs.
	function clearSetTimeout() {
		if (timeoutId.current !== -1) {
			window.clearTimeout(timeoutId.current);
			timeoutId.current = -1;
		}
	}
	// Function is safe to reuse because it only deals with refs and setState.
	function startSetTimeout(callback: () => void, timeout: number) {
		timeoutId.current = window.setTimeout(() => {
			timeoutId.current = -1;
			callback();
		}, timeout);
	}

	// Handle hook cleanup.
	React.useEffect(() => {
		return () => {
			clearSetTimeout();
		};
	}, []);

	// Handle when passive changes and the timer is done.
	React.useEffect(() => {
		if (!isPassive && state.isStarted && timeoutId.current === -1) {
			const timeRemaining = timerExpiration.current - (Date.now() - state.lastStartedAt!);
			startSetTimeout(function () {
				clearSetTimeout();
				setState((p) => {
					return {
						...p,
						isStarted: false,
						lastFinishedAt: Date.now()
					};
				});
			}, timeRemaining);
		}
		else if (isPassive && state.isStarted) {
			clearSetTimeout();
		}
	}, [isPassive, state.isStarted, state.lastStartedAt]);

	return React.useMemo<PassiveTimerOutput>(() => {
		function stop(): void {
			clearSetTimeout();
			setState((p) => {
				if (!p.isStarted) {
					return p;
				}
				return {
					...p,
					isStarted: false
				};
			});
		}

		function restart(expiration?: number): void {
			clearSetTimeout();
			if (expiration) {
				timerExpiration.current = expiration;
			}
			setState((p) => {
				return {
					...p,
					isStarted: true,
					lastStartedAt: Date.now()
				};
			});
		}

		return {
			...state,
			stop: stop,
			restart: restart
		};
	}, [state]);
};


export interface VisibilityTimerInput extends PassiveTimerInput {
}

export interface VisibilityTimerState extends PassiveTimerState {
}

export interface VisibilityTimerOutput extends PassiveTimerOutput {
}

export function useVisibilityTimer(input: VisibilityTimerInput) {
	// Tells us whether the document is visible (not hidden from minimization, changed tab, etc).
	const documentVisibility = useDocumentVisibility();
	return usePassiveTimer(input, !documentVisibility);
}
