import * as React from 'react';
import { decorate } from '@/test/decorate';
import { button, text, number } from '@storybook/addon-knobs';
import { createNamespace } from './local-storage';

export default { title: 'Storage/Local Storage' };

const namespace = 'react-common-test';
const localStorage = createNamespace(namespace, '...');

export const TestLocalStorage = decorate('Local Storage', () => {

	const [isShowingTest, setIsShowingTest] = React.useState(true);

	button('Reset', () => {
		setIsShowingTest(false);
	});

	React.useEffect(() => {
		setIsShowingTest(true);
	});

	if (isShowingTest) {
		return <Test />;
	}
	return <p>...</p>;
});

const Test: React.FC = () => {
	const key = text('Key', 'val');
	const defaultValue = number('Default Value', 0);

	const [state, setState] = localStorage.useLocalStorage<number>(key, (value) => {
		if (value === undefined) {
			return defaultValue;
		}
		return value;
	});

	const item = localStorage.getItem(key);

	button('Increment', () => {
		setState(state + 1);
	});

	button('Decrement', () => {
		setState(state - 1);
	});

	button('Set Undefined', () => {
		setState(undefined);
	});

	return (
		<>
			<p>namespace: {namespace}</p>
			<p>key: {key}</p>
			<p>value: {state}</p>
			<p>item: {JSON.stringify(item, null, 3)}</p>
		</>
	);

};