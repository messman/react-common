import * as React from 'react';
import { TestWrapper, useTestButtons } from '@/test/decorate';
import { usePrevious } from './previous';

export default () => {

	const [lastAction, setLastAction] = React.useState('');
	const [count, setCount] = React.useState(0);

	const prevCount = usePrevious(count);

	function change(action: string, modifier: number): void {
		setLastAction(action);
		setCount((p) => {
			return p + modifier;
		});
	}

	const buttonSet = useTestButtons({
		'Add 5': () => {
			change('Add 5', 5);
		},
		'Add 1': () => {
			change('Add 1', 1);
		},
		'Subtract 1': () => {
			change('Subtract 1', -1);
		},
		'Subtract 5': () => {
			change('Subtract 5', -5);
		},
		'Reset': () => {
			setLastAction('');
			setCount(0);
		},
	});

	const previousCountText = prevCount !== undefined ? <p>Previous: {prevCount}</p> : <></>;
	const lastActionText = lastAction ? <p>Action: {lastAction}</p> : <></>;

	// Display both current and previous count value
	return (
		<TestWrapper>
			{buttonSet}
			{previousCountText}
			{lastActionText}
			<p>Count: {count} </p>
		</TestWrapper>
	);
};