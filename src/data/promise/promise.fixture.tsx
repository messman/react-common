import * as React from 'react';
import { clampPromise, usePromise, getDebugPromiseStatus } from './promise';
import { seconds } from '@/utility/time/time';
import { TestWrapper, useTestButtons } from '@/test/decorate';
import { useValue } from 'react-cosmos/fixture';

export default () => {

	const [useMinimum] = useValue('Use Minimum Timeout', { defaultValue: true });
	const [inputMinimum] = useValue('Minimum Timeout', { defaultValue: 1 });
	const minimum = useMinimum ? seconds(inputMinimum) : null;

	const [useMaximum] = useValue('Use Maximum Timeout', { defaultValue: true });
	const [inputMaximum] = useValue('Maximum Timeout', { defaultValue: 5 });
	const maximum = useMaximum ? seconds(inputMaximum) : null;

	const [actual] = useValue('Actual Timeout', { defaultValue: 3 });
	const actualSeconds = seconds(actual);
	const [clear] = useValue('Clear', { defaultValue: true });
	const newResultValues = clear ? null : undefined;

	const promiseFunc = React.useCallback(() => {
		return clampPromise(getTestInfo(actualSeconds), minimum, maximum);
	}, [actualSeconds, minimum, maximum]);

	const promiseOutput = usePromise({
		isStarted: true,
		promiseFunc: promiseFunc
	}, (data, error) => {
		console.log('promise finished', data, error);
		return {
			isStarted: false
		};
	});

	const buttonSet = useTestButtons({
		'Stop': () => {
			promiseOutput.reset({
				isStarted: false,
				promiseFunc: promiseFunc,
				data: newResultValues,
				error: newResultValues,
			});
		},
		'Reset': () => {
			promiseOutput.reset({
				isStarted: true,
				promiseFunc: promiseFunc,
				data: newResultValues,
				error: newResultValues,
			});
		},
	});

	return (
		<TestWrapper>
			{buttonSet}
			<p>Status: {getDebugPromiseStatus(promiseOutput)}</p>
		</TestWrapper>
	);
};

let globalIncrement: number = 0;

async function getTestInfo(timeout: number): Promise<string> {
	return new Promise((res) => {
		window.setTimeout(() => {
			res(`[random: ${Math.round(Math.random() * 10)}, increment: ${globalIncrement++}]`);
		}, timeout);
	});
}