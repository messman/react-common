import * as React from 'react';
import { decorate } from '@/test/decorate';
import { button } from '@storybook/addon-knobs';
import { usePrevious } from './previous';

export default { title: 'Utility/Previous' };

export const TestPrevious = decorate('Previous', () => {

	const [lastAction, setLastAction] = React.useState('');
	const [count, setCount] = React.useState(0);

	const prevCount = usePrevious(count);

	function change(action: string, modifier: number): void {
		setLastAction(action);
		setCount((p) => {
			return p + modifier;
		});
	}

	button('Add 5', () => {
		change('Add 5', 5);
	});

	button('Add 1', () => {
		change('Add 1', 1);
	});

	button('Subtract 1', () => {
		change('Subtract 1', -1);
	});

	button('Subtract 5', () => {
		change('Subtract 5', -5);
	});

	button('Reset', () => {
		setLastAction('');
		setCount(0);
	});

	const previousCountText = prevCount !== undefined ? <p>Previous: {prevCount}</p> : <></>;
	const lastActionText = lastAction ? <p>Action: {lastAction}</p> : <></>;

	// Display both current and previous count value
	return (
		<>
			{previousCountText}
			{lastActionText}
			<p>Count: {count} </p>
		</>
	);
});