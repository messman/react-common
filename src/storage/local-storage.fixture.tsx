import * as React from 'react';
import { TestWrapper, useTestButtons } from '@/test/decorate';
import { createNamespace } from './local-storage';
import { useValue } from 'react-cosmos/fixture';

const namespace = 'react-common-test';
const localStorage = createNamespace(namespace, '...');
const defaultValue = 0;

export default () => {
	const [key] = useValue('Key', { defaultValue: 'val' });

	const [state, setState] = localStorage.useLocalStorage<number>(key, (value) => {
		if (value === undefined) {
			return defaultValue;
		}
		return value;
	});

	const item = localStorage.getItem(key);

	const buttonSet = useTestButtons({
		'Increment': () => {
			setState(state + 1);
		},
		'Decrement': () => {
			setState(state - 1);
		},
		'Set Undefined': () => {
			setState(undefined);
		},
	});

	return (
		<TestWrapper>
			{buttonSet}
			<p>namespace: {namespace}</p>
			<p>key: {key}</p>
			<p>value: {state}</p>
			<p>item: {JSON.stringify(item, null, 3)}</p>
		</TestWrapper>
	);
};