import * as React from 'react';
import { useDocumentVisibility } from '../visibility/visibility';

interface SafeTimerInput {
	expiration: number;
	isStarted: boolean;
}

interface SafeTimerState {
	isStarted: boolean;
	expired: number | null;
}

interface SafeTimerOutput extends SafeTimerState {
	reset: (input: Partial<SafeTimerInput>) => void;
}

export function createSafeTimerContext(): [React.Provider<SafeTimerOutput>, () => SafeTimerOutput] {
	const Context = React.createContext<SafeTimerOutput>(null!);
	const consumer = () => React.useContext(Context);
	return [Context.Provider, consumer];
}

export function useSafeTimer(input: SafeTimerInput) {

	// Tells us whether the document is visible (not hidden from minimization, changed tab, etc).
	const documentVisibility = useDocumentVisibility();

	// Tracks timer expiration.
	const timerExpiration = React.useRef<number>(input.expiration);
	// Tracks the time when the timer started.
	const timerStarted = React.useRef<number | null>(null);
	// Tracks the timeout for cancellation.
	const timeoutId = React.useRef<number>(-1);

	// Function is safe to reuse because it only deals with refs.
	function clearSetTimeout() {
		if (timeoutId.current !== -1) {
			window.clearTimeout(timeoutId.current);
			timeoutId.current = -1;
		}
	}

	// Function is safe to reuse because it only deals with refs and setState.
	function startSetTimeout(timeout: number) {
		timeoutId.current = window.setTimeout(() => {
			timerStarted.current = null;
			clearSetTimeout();

			setState({
				isStarted: false,
				expired: Date.now()
			});
		}, timeout);
	}

	// First-time setup of state.
	const [state, setState] = React.useState<SafeTimerState>({
		isStarted: input.isStarted,
		expired: null,
	});

	// Handle hook cleanup.
	React.useEffect(() => {
		return () => {
			timerStarted.current = null;
			clearSetTimeout();
		};
	}, []);

	// Handle timer starting.
	React.useEffect(() => {
		// Cancel any existing timers.
		timerStarted.current = null;
		clearSetTimeout();

		// If we aren't supposed to start, exit.
		if (!state.isStarted) {
			return;
		}

		// Track our start time and set a timeout.
		timerStarted.current = Date.now();
		startSetTimeout(timerExpiration.current);
	}, [state, state.isStarted]);

	// Handle changes in visibility.
	React.useEffect(() => {
		// Stop just the timer - maintain our connection to when the timer started.
		clearSetTimeout();
		// If we are hidden, exit.
		if (!documentVisibility) {
			return;
		}

		// Retrieve the time that we started the timeout, so we can restore it.
		const startedTime = timerStarted.current;
		if (!startedTime) {
			return;
		}

		// Start the timeout again just for the remaining time.
		const timeElapsed = Date.now() - startedTime;
		const timeRemaining = Math.max(timerExpiration.current - timeElapsed, 0);
		startSetTimeout(timeRemaining);
	}, [documentVisibility]);

	// Create our output functions.
	const output: SafeTimerOutput = React.useMemo(() => {

		// Change the timer as needed.
		function reset(newInput: Partial<SafeTimerInput>): void {
			// Cancel any existing timer.
			timerStarted.current = null;
			clearSetTimeout();

			const isStarted = newInput.isStarted || false;
			timerExpiration.current = newInput.expiration || timerExpiration.current;
			setState({
				expired: null,
				isStarted: isStarted
			});
		}

		return {
			...state,
			reset: reset
		};
	}, [state]);

	return output;
};

export function seconds(seconds: number): number {
	return seconds * 1000;
}

export function minutes(minutes: number): number {
	return seconds(minutes * 60);
}

export function hours(hours: number): number {
	return minutes(hours * 60);
}

