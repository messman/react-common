import * as React from 'react';
import { decorate } from '@/test/decorate';
import { button, boolean, number } from '@storybook/addon-knobs';
import { clampPromise, clampPromiseMaximumTimeoutReason, useDataControlledPromise } from './promise';
import { seconds } from '@/utility/time/time';
import { getPromiseStatus } from '@/test/shared';

export default { title: 'Data/Promise' };

export const TestPromise = decorate('Promise', () => {

	const useMinimum = boolean('Use Minimum Timeout', true);
	const inputMinimum = seconds(number('Minimum Timeout', 1));
	const minimum = useMinimum ? inputMinimum : null;

	const useMaximum = boolean('Use Maximum Timeout', true);
	const inputMaximum = seconds(number('Maximum Timeout', 5));
	const maximum = useMaximum ? inputMaximum : null;

	const actual = seconds(number('Actual Timeout', 3));
	const clear = boolean('Clear', true);

	const promiseFunc = React.useCallback(() => {
		return clampPromise(getTestInfo(actual), minimum, maximum);
	}, [actual, minimum, maximum]);

	const promiseOutput = useDataControlledPromise(true, promiseFunc, (data, error) => {
		console.log('promise finished', data, error);
		return {
			run: false
		};
	});

	button('Stop', () => {
		promiseOutput.reset({
			run: false,
			clear: clear
		});
	});

	button('Reset', () => {
		promiseOutput.reset({
			run: true,
			clear: clear
		});
	});

	const error = promiseOutput.error?.message || '';
	const isErrorFromMaximum = error === clampPromiseMaximumTimeoutReason;

	return (
		<>
			<p>Status: {getPromiseStatus(promiseOutput.isRunning, promiseOutput.data, promiseOutput.error)}</p>
			<p>Is Error Caused By Maximum Timeout?: {isErrorFromMaximum ? 'Yes' : 'No'}</p>
		</>
	);
});

let globalIncrement: number = 0;

async function getTestInfo(timeout: number): Promise<string> {
	return new Promise((res) => {
		window.setTimeout(() => {
			res(`[random: ${Math.round(Math.random() * 10)}, increment: ${globalIncrement++}]`);
		}, timeout);
	});
}