import * as React from 'react';
import { decorate } from '@/test/decorate';
import { number, button } from '@storybook/addon-knobs';
import { useVisibilityTimer, VisibilityTimerOutput } from './timer';
import { createContextConsumer } from '@/utility/context/context';
import { getTimerStatus } from '@/test/shared';
import { seconds } from '@/utility/time/time';
import { useDocumentVisibility } from '../visibility/visibility';

export default { title: 'Lifecycle/Timer' };

const [ProviderA, consumerA] = createContextConsumer<VisibilityTimerOutput>();
const [ProviderB, consumerB] = createContextConsumer<VisibilityTimerOutput>();

export const TestTimer = decorate('Timer', () => {

	const documentVisibility = useDocumentVisibility();

	const expirationA = seconds(number('Timeout A', 5, { step: 1 }));

	const expirationB = seconds(number('Timeout B', 8, { step: 1 }));

	const timerA = useVisibilityTimer({
		expiration: expirationA,
		start: true
	});

	const timerB = useVisibilityTimer({
		expiration: expirationB,
		start: false
	});

	button('Stop A', () => {
		timerA.stop();
	});

	button('Restart A', () => {
		timerA.restart(expirationA);
	});

	button('Stop B', () => {
		timerB.stop();
	});

	button('Restart B', () => {
		timerB.restart();
	});

	return (
		<>
			<p>A: {getTimerStatus(timerA, !documentVisibility)}</p>
			<p>B: {getTimerStatus(timerB, !documentVisibility)}</p>
			<ProviderA value={timerA}>
				<ProviderB value={timerB}>
					<TimerResponder text='A' consumer={consumerA} />
					<TimerResponder text='B' consumer={consumerB} />
				</ProviderB>
			</ProviderA>
		</>
	);
});

interface TimerResponserProps {
	text: string;
	consumer: () => VisibilityTimerOutput;
}

const TimerResponder: React.FC<TimerResponserProps> = (props) => {
	const { text, consumer } = props;
	const timer = consumer();

	const documentVisibility = useDocumentVisibility();
	const [count, setCount] = React.useState(0);

	React.useEffect(() => {
		if (!timer.isStarted && timer.lastFinishedAt && timer.lastFinishedAt > timer.lastStartedAt!) {
			setCount((p) => p + 1);
		}
	}, [timer, timer.isStarted, timer.lastFinishedAt, timer.lastStartedAt]);

	return (
		<p>{text}: {getTimerStatus(timer, !documentVisibility)} ({count})</p>
	);
};