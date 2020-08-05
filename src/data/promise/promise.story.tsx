import * as React from 'react';
import { decorate } from '@/test/decorate';
import { button, boolean, number } from '@storybook/addon-knobs';
import { clampPromise, usePromise, clampPromiseMaximumTimeoutReason } from './promise';

export default { title: 'services' };

export const TestPromise = decorate(() => {

	const useMinimum = boolean('Use Minimum', true);
	const inputMinimum = number('Minimum', 500);
	const minimum = useMinimum ? inputMinimum : null;

	const useMaximum = boolean('Use Maximum', true);
	const inputMaximum = number('Maximum', 5000);
	const maximum = useMaximum ? inputMaximum : null;

	const actual = number('Actual', 3000);

	const clampedPromiseFunc = React.useCallback(() => {
		return clampPromise(getTestInfo(actual), minimum, maximum);
	}, [actual, minimum, maximum]);

	const promiseState = usePromise({
		promiseFunc: clampedPromiseFunc,
		runImmediately: false
	});

	const clear = boolean('Clear', true);

	button('Stop', () => {
		promiseState.reset({
			promiseFunc: clampedPromiseFunc,
			clearExistingState: clear
		});
	});

	button('Run', () => {
		promiseState.reset({
			promiseFunc: clampedPromiseFunc,
			runImmediately: true,
			clearExistingState: clear
		});
	});


	const random = promiseState.data?.random.toString() || '';
	const increment = promiseState.data?.increment.toString() || '';
	const error = promiseState.error?.message || '';
	const isErrorFromMaximum = error === clampPromiseMaximumTimeoutReason;

	return (
		<>
			<p>Is Running: {promiseState.isRunning.toString()}</p>
			<p>Random: {random}</p>
			<p>Increment: {increment}</p>
			<p>Error: {error}</p>
			<p>Is From Max: {isErrorFromMaximum.toString()}</p>
		</>
	);
});

let globalIncrement: number = 0;

interface TestInfo {
	random: number,
	increment: number;
}

async function getTestInfo(timeout: number): Promise<TestInfo> {
	return new Promise((res) => {
		window.setTimeout(() => {
			res({
				random: Math.round(Math.random() * 10),
				increment: globalIncrement++
			});
		}, timeout);
	});
}