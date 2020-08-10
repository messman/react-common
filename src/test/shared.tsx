import { PromiseOutput } from '@/data/promise/promise';

export function getTruthyTimerStatus(isStarted: boolean, timeout: number, isTruthy: boolean) {
	const startedText = isStarted ? 'started' : 'idle';
	const timeoutText = isStarted ? ` (${timeout})` : '';
	const truthyText = isStarted ? ` (${isTruthy ? 'truthy' : 'falsy'})` : '';
	return [startedText, timeoutText, truthyText].join('');
}

export function getPromiseStatus<T>(promiseOutput: PromiseOutput<T>) {
	if (promiseOutput.isRunning) {
		return 'running';
	}
	if (promiseOutput.data) {
		return 'idle, with data';
	}
	if (promiseOutput.error) {
		return 'idle, with error';
	}
	return 'idle';
}