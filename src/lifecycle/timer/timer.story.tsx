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

	const timerA = useControlledTruthyTimer(true, timeoutA, documentVisibility, () => {
		console.log('completed A');
		return false;
	});

	const timerB = useControlledTruthyTimer(false, timeoutB, documentVisibility, () => {
		console.log('completed B');
		return true;
	});

	button('Stop A', () => {
		timerA.reset(false);
	});

	button('Restart A', () => {
		timerA.reset(true);
	});

	button('Stop B', () => {
		timerB.reset(false);
	});

	button('Restart B', () => {
		timerB.reset(true);
	});

	return (
		<>
			<p>Controlled Truthy Timer</p>
			<p>Visibility: {documentVisibility ? 'visible' : 'hidden'}</p>
			<p>A: {getTruthyTimerStatus(timerA.isStarted, timeoutA, documentVisibility)}</p>
			<p>B: {getTruthyTimerStatus(timerB.isStarted, timeoutB, documentVisibility)}</p>
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