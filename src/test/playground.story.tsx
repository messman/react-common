import * as React from 'react';
import { decorate } from '@/test/decorate';

export default { title: 'Test/Playground' };

export const TestPhases = decorate('React Phases', () => {

	console.log('render - before');
	const [count, setCount] = React.useState(0);
	const [isExpired, dispatch] = React.useReducer(function (state: boolean, action: string) {
		console.log('reducer', state);
		if (action === 'expire') {
			return true;
		}
		// Else, reset.
		return false;
	}, false);
	console.log('render - after');

	const ref = React.useRef(-1);

	React.useEffect(() => {
		console.log('effect');
		dispatch('reset');
		ref.current = window.setTimeout(() => {
			console.log('timeout');
			dispatch('expire');
		}, 15000);
		return () => {
			console.log('effect - cleanup');
			clearTimeout(ref.current);
			ref.current = -1;
		};
	}, [count]);

	function onClick() {
		console.log('onclick');
		setCount(p => p + 1);
	}

	return (
		<>
			<p>Count: {count}</p>
			<p>Is Expired: {isExpired.toString()}</p>
			<button onClick={onClick}>Increment</button>
		</>
	);
});