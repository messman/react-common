import * as React from 'react';
import { decorate } from '@/test/decorate';
import { button, boolean, number } from '@storybook/addon-knobs';
import { clampPromise, usePromise, getDebugPromiseStatus } from './promise';
import { seconds } from '@/utility/time/time';

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
	const newResultValues = clear ? null : undefined;

	const promiseFunc = React.useCallback(() => {
		return clampPromise(getTestInfo(actual), minimum, maximum);
	}, [actual, minimum, maximum]);

	const promiseOutput = usePromise({
		isStarted: true,
		promiseFunc: promiseFunc
	}, (data, error) => {
		console.log('promise finished', data, error);
		return {
			isStarted: false
		};
	});

	button('Stop', () => {
		promiseOutput.reset({
			isStarted: false,
			promiseFunc: promiseFunc,
			data: newResultValues,
			error: newResultValues,
		});
	});

	button('Reset', () => {
		promiseOutput.reset({
			isStarted: true,
			promiseFunc: promiseFunc,
			data: newResultValues,
			error: newResultValues,
		});
	});

	return (
		<>
			<p>Status: {getDebugPromiseStatus(promiseOutput)}</p>
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