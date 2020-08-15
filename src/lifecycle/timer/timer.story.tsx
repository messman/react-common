import * as React from 'react';
import { decorate } from '@/test/decorate';
import { number, button } from '@storybook/addon-knobs';
import { useTruthyTimer, getDebugTruthyTimerStatus } from './timer';
import { seconds } from '@/utility/time/time';
import { useDocumentVisibility } from '../visibility/visibility';

export default { title: 'Lifecycle/Timer' };

export const TestTruthyTimer = decorate('Truthy Timer', () => {

	const documentVisibility = useDocumentVisibility();

	const timeoutA = seconds(number('Timeout A', 5));
	const timeoutB = seconds(number('Timeout B', 8));

	const timeoutCRef = React.useRef(8000);

	const timerA = useTruthyTimer({
		isStarted: true,
		timeout: timeoutA
	}, documentVisibility, () => {
		console.log('completed A');
	});

	const timerB = useTruthyTimer({
		isStarted: false,
		timeout: timeoutB
	}, documentVisibility, () => {
		console.log('completed B');
	});

	const timerC = useTruthyTimer({
		isStarted: true,
		timeout: timeoutCRef.current
	}, documentVisibility, () => {
		console.log('completed C');
		timeoutCRef.current = Math.max(timeoutCRef.current - 1000, 3000);
		return {
			isStarted: true,
			timeout: timeoutCRef.current
		};
	});

	button('Stop A', () => {
		timerA.reset({
			isStarted: false
		});
	});

	button('Restart A', () => {
		timerA.reset({
			isStarted: true
		});
	});

	button('Stop B', () => {
		timerB.reset({
			isStarted: false
		});
	});

	button('Restart B', () => {
		timerB.reset({
			isStarted: true
		});
	});

	return (
		<>
			<p>Truthy Timers</p>
			<p>Visibility: {documentVisibility ? 'visible' : 'hidden'}</p>
			<p>A: {getDebugTruthyTimerStatus(timerA)}</p>
			<p>B: {getDebugTruthyTimerStatus(timerB)}</p>
			<p>C: {getDebugTruthyTimerStatus(timerC)}</p>
		</>
	);
});