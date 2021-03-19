import * as React from 'react';
import { useTestButtons, wrap } from '@/test/decorate';
import { useTruthyTimer, getDebugTruthyTimerStatus } from './timer';
import { seconds } from '@/utility/time/time';
import { useDocumentVisibility } from '../visibility/visibility';
import { useValue } from 'react-cosmos/fixture';

export default wrap(() => {

	const documentVisibility = useDocumentVisibility();

	const timeoutA = seconds(useValue('Timeout A', { defaultValue: 5 })[0]);
	const timeoutB = seconds(useValue('Timeout B', { defaultValue: 8 })[0]);

	const timeoutCRef = React.useRef(8000);

	const timerA = useTruthyTimer({
		isStarted: true,
		timeout: timeoutA
	}, documentVisibility, () => {
		console.log('completed A');
	});

	const timerB = useTruthyTimer({
		isStarted: false,
		timeout: timeoutB,
		startedAt: Date.now() - 3000
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

	const buttonSet = useTestButtons({
		'Stop A': () => {
			timerA.reset({
				isStarted: false
			});
		},
		'Restart A': () => {
			timerA.reset({
				isStarted: true
			});
		},
		'Stop B': () => {
			timerB.reset({
				isStarted: false
			});
		},
		'Restart B': () => {
			timerB.reset({
				isStarted: true
			});
		},
	});

	return (
		<>
			{buttonSet}
			<p>Truthy Timers</p>
			<p>Visibility: {documentVisibility ? 'visible' : 'hidden'}</p>
			<p>A: {getDebugTruthyTimerStatus(timerA)}</p>
			<p>B: {getDebugTruthyTimerStatus(timerB)}</p>
			<p>C: {getDebugTruthyTimerStatus(timerC)}</p>
		</>
	);
});