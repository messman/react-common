import { PassiveTimerOutput } from '@/lifecycle/timer/timer';
import { PromiseOutput } from '@/data/promise/promise';

export function getTimerStatus(timerOutput: PassiveTimerOutput, passive?: boolean) {
	const { isStarted, lastStartedAt, lastFinishedAt } = timerOutput;

	if (isStarted) {
		if (passive) {
			return 'started (passive)';
		}
		return 'started';
	}
	if (lastFinishedAt && lastFinishedAt > lastStartedAt!) {
		const date = new Date(lastFinishedAt!);
		return `finished at ${date.toLocaleTimeString()}`;
	}
	if (lastStartedAt && (!lastFinishedAt || lastFinishedAt < lastStartedAt)) {
		return `stopped`;
	}
	return 'idle';
}

export function getTimerStatus2(isStarted: boolean, isPassive?: boolean) {

	if (isStarted) {
		if (isPassive) {
			return 'started (passive)';
		}
		return 'started';
	}
	return 'idle';
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