import * as React from 'react';
import { decorate } from '@/test/decorate';
import { number, button } from '@storybook/addon-knobs';
import { useSafeTimer, createSafeTimerContext, SafeTimerOutput, seconds } from './timer';

export default { title: 'Lifecycle/Timer' };

const [ProviderA, consumerA] = createSafeTimerContext();
const [ProviderB, consumerB] = createSafeTimerContext();

export const TestTimer = decorate('Timer', () => {

	const expirationA = number('Expiration A', seconds(10));

	const expirationB = number('Expiration B', seconds(15));

	const timerA = useSafeTimer({
		expiration: expirationA,
		startImmediately: false
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
			<p>A: {getStatus(timerA)}</p>
			<p>B: {getStatus(timerB)}</p>
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
		<p>{text}: {getStatus(timer)} ({count})</p>
	);
};

function getStatus(timerOutput: SafeTimerOutput) {
	if (timerOutput.expired) {
		const date = new Date(timerOutput.expired);
		return `expired at ${date.toTimeString()}`;
	}
	if (timerOutput.isStarted) {
		return 'running';
	}
	return 'not running';
}