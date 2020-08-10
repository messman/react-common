import * as React from 'react';
import { useDocumentVisibility } from '../visibility/visibility';
import { useLatest } from '@/utility/render/render';


// function useTimeout(isStarted: boolean, timeout: number, callback: () => void): void {
// 	/*
// 		Sure, we could always restart the timer when the callback changes, but that would break down the precision of the timer.
// 		So for this special case, always hold the most recent version of the callback just to use at the end.
// 	*/
// 	const latestCallback = useLatest(callback);

// 	React.useEffect(() => {
// 		let timeoutId = -1;
// 		if (isStarted) {
// 			timeoutId = window.setTimeout(() => {
// 				latestCallback.current();
// 			}, timeout);
// 		}

// 		return () => {
// 			// Cleanup
// 			window.clearTimeout(timeoutId);
// 		};
// 	}, [isStarted, timeout]);
// }


export function useTruthyTimer2(isStarted: boolean, timeout: number, isTruthy: boolean, callback: () => void, restartOn?: any[]): void {

	/*
		Sure, we could always restart the timer when the callback changes, but that would break down the precision of the timer.
		So for this special case, always hold the most recent version of the callback just to use at the end.
	*/
	const latestCallback = useLatest(callback);

	// Tracks the most recent start time. Needed to counteract the setTimeout.
	const timerStartedAt = React.useRef<number | null>(null);

	restartOn = restartOn || [];

	/*
		This effect runs like a change callback, which we need in order to counteract the setTimeout.
	*/
	React.useEffect(() => {
		timerStartedAt.current = isStarted ? Date.now() : null;
	}, [isStarted, timeout, ...restartOn]);

	const isStartedInternalTimer = isStarted && isTruthy;

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

export function useTruthyTimer(isStarted: boolean, timeout: number, isTruthy: boolean, callback: () => void): void {

	/*
		Sure, we could always restart the timer when the callback changes, but that would break down the precision of the timer.
		So for this special case, always hold the most recent version of the callback just to use at the end.
	*/
	const latestCallback = useLatest(callback);

	// Tracks the most recent start time.
	const timerStartedAt = React.useRef<number | null>(null);

	/*


	*/
	React.useEffect(() => {
		timerStartedAt.current = isStarted ? Date.now() : null;
	}, [isStarted, timeout]);

	const isStartedInternalTimer = isStarted && isTruthy;

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
	}, [isStartedInternalTimer, timeout]);
}

export function usePassiveTimer2(isStarted: boolean, timeout: number, isPassive: boolean, callback: () => void): void {

	/*
		Sure, we could always restart the timer when the callback changes, but that would break down the precision of the timer.
		So for this special case, always hold the most recent version of the callback just to use at the end.
	*/
	const latestCallback = useLatest(callback);

	// Tracks the most recent start time.
	const timerStartedAt = React.useRef<number | null>(null);

	React.useEffect(() => {
		if (isStarted) {
			if (timerStartedAt.current === null) {
				timerStartedAt.current = Date.now();
			}
		}
		else {
			timerStartedAt.current = null;
		}
	}, [isStarted]);

	// Handle when passive changes and the timer is done.
	React.useEffect(() => {

		let timeoutId = -1;

		if (isStarted && !isPassive) {

			let timeRemaining = timeout;
			if (timerStartedAt.current) {
				const timePassed = Date.now() - timerStartedAt.current;
				timeRemaining = timeout - timePassed;
			}

			timeoutId = window.setTimeout(() => {
				timerStartedAt.current = null;
				latestCallback.current();
			}, timeRemaining);

		}

		return () => {
			// Cleanup
			window.clearTimeout(timeoutId);
		};
	}, [isStarted, timeout, isPassive]);

};


export function useVisibilityTimer2(isStarted: boolean, timeout: number, callback: () => void): void {
	// Tells us whether the document is visible (not hidden from minimization, changed tab, etc).
	const documentVisibility = useDocumentVisibility();
	return usePassiveTimer2(isStarted, timeout, !documentVisibility, callback);
}


// // Handle when passive changes and the timer is done.
// React.useEffect(() => {
// 	if (isStarted) {
// 		if (isPassive) {
// 			clearSetTimeout();
// 			timeoutRef.current = timeout;
// 			if (timerStartedAt.current === null) {
// 				timerStartedAt.current = Date.now();
// 			}
// 		}
// 		else {
// 			if (timeout !== timeoutRef.current) {
// 				timeoutRef.current = timeout;
// 				clearAll();
// 			}

// 			if (timeoutId.current === -1) {
// 				let timeRemaining = timeout;
// 				if (timerStartedAt.current) {
// 					const timePassed = Date.now() - timerStartedAt.current;
// 					timeRemaining = timeout - timePassed;
// 				}

// 				timeoutId.current = window.setTimeout(() => {
// 					clearAll();
// 					latestCallback.current();
// 				}, timeRemaining);
// 			}
// 		}
// 	}
// 	else {
// 		clearAll();
// 	}
// }, [isStarted, timeout, isPassive]);


