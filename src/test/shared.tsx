import { SafeTimerOutput } from '@/lifecycle/timer/timer';

export function getTimerStatus(timerOutput: SafeTimerOutput) {
	if (timerOutput.expired) {
		const date = new Date(timerOutput.expired);
		return `expired at ${date.toTimeString()}`;
	}
	if (timerOutput.isStarted) {
		return 'running';
	}
	return 'not running';
}