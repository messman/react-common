import * as React from 'react';
import { createContextConsumer } from './context';

interface Some {
	value: number;
}
const defaultSome: Some = {
	value: 8
};

const [_WrongNoneProvider, wrongNoneContext] = createContextConsumer<Some>();
const [_WrongSomeProvider, wrongSomeContext] = createContextConsumer<Some>(defaultSome);
const [RightNoneProvider, rightNoneContext] = createContextConsumer<Some>();
const [RightSomeProvider, rightSomeContext] = createContextConsumer<Some>(defaultSome);

export default {
	'Wrong None': () => {
		return (
			<Child hook={wrongNoneContext} />
		);
	},
	'Wrong Some': () => {
		return (
			<Child hook={wrongSomeContext} />
		);
	},
	'Right None': () => {
		return (
			<RightNoneProvider value={{ value: 10 }}>
				<Child hook={rightNoneContext} />
			</RightNoneProvider>
		);
	},
	'Right Some': () => {
		return (
			<RightSomeProvider value={{ value: 12 }}>
				<Child hook={rightSomeContext} />
			</RightSomeProvider>
		);
	},
};

interface ChildProps {
	hook: () => Some;
}

const Child: React.FC<ChildProps> = (props) => {
	const some = props.hook();

	if (some === null) {
		return (
			<p>Would have caused error - see console</p>
		);
	}
	return (
		<p>Value: {some.value.toString()}</p>
	);
};