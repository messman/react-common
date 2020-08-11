
export function getTruthyTimerStatus(isStarted: boolean, timeout?: number | null, isTruthy?: boolean) {
	const startedText = isStarted ? 'started' : 'idle';
	const timeoutText = (isStarted && !!timeout) ? ` (${timeout})` : '';
	const truthyText = (isStarted && isTruthy !== undefined) ? ` (${isTruthy ? 'truthy' : 'falsy'})` : '';
	return startedText + timeoutText + truthyText;
}

export function getPromiseStatus(isRunning: boolean, data: any | null, error: Error | null) {

	const runningText = isRunning ? 'running' : 'idle';
	const dataText = data ? ` (has data: ${data?.toString() || ''})` : '';
	const errorText = error ? ` (has error: ${error?.message || ''})` : '';
	return runningText + dataText + errorText;
}