import * as React from 'react';
import { decorate } from '@/test/decorate';
import { number, button } from '@storybook/addon-knobs';
import { useControlledTruthyTimer, useTruthyTimer } from './timer';
import { seconds } from '@/utility/time/time';
import { useDocumentVisibility } from '../visibility/visibility';
import { getTruthyTimerStatus } from '@/test/shared';

export default { title: 'Lifecycle/Timer' };

export const TestControlledTruthyTimer = decorate('Controlled Truthy Timer', () => {

	const documentVisibility = useDocumentVisibility();

	const timeoutA = seconds(number('Timeout A', 5));
	const timeoutB = seconds(number('Timeout B', 8));

	const timerA = useControlledTruthyTimer({
		start: true,
		timeout: timeoutA
	}, documentVisibility);

	const timerB = useControlledTruthyTimer({
		start: false,
		timeout: timeoutB
	}, documentVisibility);

	button('Stop A', () => {
		timerA.stop();
	});

	button('Restart A', () => {
		timerA.restart(timeoutA);
	});

	button('Stop B', () => {
		timerB.stop();
	});

	button('Restart B', () => {
		timerB.restart(timeoutB);
	});

	return (
		<>
			<p>Controlled Truthy Timer</p>
			<p>Visibility: {documentVisibility ? 'visible' : 'hidden'}</p>
			<p>A: {getTruthyTimerStatus(timerA.isStarted, timerA.timeout, documentVisibility)}</p>
			<p>B: {getTruthyTimerStatus(timerB.isStarted, timerB.timeout, documentVisibility)}</p>
		</>
	);
});

export const TestTruthyTimer = decorate('Truthy Timer', () => {

	const documentVisibility = useDocumentVisibility();

	const [isStartedA, setIsStartedA] = React.useState(true);
	const [isStartedB, setIsStartedB] = React.useState(false);

	const timeoutA = seconds(number('A - Timeout', 5));
	const timeoutB = seconds(number('B - Timeout', 8));

	button('Start A', () => {
		setIsStartedA(true);
	});
	button('Stop A', () => {
		setIsStartedA(false);
	});

	button('Start B', () => {
		setIsStartedB(true);
	});
	button('Stop B', () => {
		setIsStartedB(false);
	});

	useTruthyTimer(isStartedA, timeoutA, documentVisibility, () => {
		setIsStartedA(false);
	});

	useTruthyTimer(isStartedB, timeoutB, documentVisibility, () => {
		setIsStartedB(false);
	});

	return (
		<>
			<p>Truthy Timer</p>
			<p>Visibility: {documentVisibility ? 'visible' : 'hidden'}</p>
			<p>A: {getTruthyTimerStatus(isStartedA, timeoutA, documentVisibility)}</p>
			<p>B: {getTruthyTimerStatus(isStartedB, timeoutB, documentVisibility)}</p>
		</>
	);
});