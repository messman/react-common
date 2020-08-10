import * as React from 'react';
import { decorate } from '@/test/decorate';
import { number, button } from '@storybook/addon-knobs';
import { useTruthyTimer2 } from './timer-2';
import { getTimerStatus2 } from '@/test/shared';
import { seconds } from '@/utility/time/time';
import { useDocumentVisibility } from '../visibility/visibility';

export default { title: 'Lifecycle/Timer 2' };

export const TestTimer = decorate('Timer 2', () => {

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

	useTruthyTimer2(isStartedA, timeoutA, documentVisibility, () => {
		setIsStartedA(false);
	});

	useTruthyTimer2(isStartedB, timeoutB, documentVisibility, () => {
		setIsStartedB(false);
	});

	return (
		<>
			<p>Visibility: {documentVisibility ? 'visible' : 'hidden'}</p>
			<p>A: {getTimerStatus2(isStartedA, !documentVisibility)}</p>
			<p>B: {getTimerStatus2(isStartedB, !documentVisibility)}</p>
		</>
	);
});




/*

	Shouldn't the callback not be there?
	Shouldn't you have some form of state to reflect what has changed? (Idle, Running, Cancelled)
	Or would that just place the onus on a useEffect for the callback? Maybe not...  not if you had cancelled as a status.



*/




