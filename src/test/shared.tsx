export function getPromiseStatus(isRunning: boolean, data: any | null, error: Error | null) {

	const runningText = isRunning ? 'running' : 'idle';
	const dataText = data ? ` (has data: ${data?.toString() || ''})` : '';
	const errorText = error ? ` (has error: ${error?.message || ''})` : '';
	return runningText + dataText + errorText;
}