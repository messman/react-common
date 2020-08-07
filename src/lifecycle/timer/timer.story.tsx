import * as React from 'react';
import { decorate } from '@/test/decorate';
import { number, button } from '@storybook/addon-knobs';
import { useSafeTimer, SafeTimerOutput, seconds } from './timer';
import { createContextConsumer } from '@/utility/context/context';
import { getTimerStatus } from '@/test/shared';

export default { title: 'Lifecycle/Timer' };

const [ProviderA, consumerA] = createContextConsumer<SafeTimerOutput>();
const [ProviderB, consumerB] = createContextConsumer<SafeTimerOutput>();

export const TestTimer = decorate('Timer', () => {

	const expirationA = number('Expiration A', seconds(10));

	const expirationB = number('Expiration B', seconds(15));

	const timerA = useSafeTimer({
		expiration: expirationA,
		startImmediately: true
	});

	const timerB = useSafeTimer({
		expiration: expirationB,
		startImmediately: false
	});

	button('Stop A', () => {
		timerA.reset({});
	});

	button('Restart A', () => {
		timerA.reset({
			expiration: expirationA,
			startImmediately: true
		});
	});

	button('Stop B', () => {
		timerB.reset({});
	});

	button('Restart B', () => {
		timerB.reset({
			expiration: expirationB,
			startImmediately: true
		});
	});

	return (
		<>
			<p>A: {getTimerStatus(timerA)}</p>
			<p>B: {getTimerStatus(timerB)}</p>
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
	consumer: () => SafeTimerOutput;
}

const TimerResponder: React.FC<TimerResponserProps> = (props) => {
	const { text, consumer } = props;
	const timer = consumer();

	const [count, setCount] = React.useState(0);

	React.useEffect(() => {
		if (timer.expired) {
			setCount((p) => p + 1);
		}
	}, [timer, timer.expired]);

	return (
		<p>{text}: {getTimerStatus(timer)} ({count})</p>
	);
};

