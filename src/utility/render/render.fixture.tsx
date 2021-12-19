import * as React from 'react';
import { TestWrapper, useTestButtons } from '@/test/decorate';
import { useEventCallback } from './render';

export default {
	'Event Callback': () => {

		const [count, setCount] = React.useState(0);
		const [isTriggered, setIsTriggered] = React.useState(false);
		const [message, setMessage] = React.useState('No message');
		const timeoutRef = React.useRef(-1);

		React.useEffect(() => {
			if (count > 5000) {
				return;
			}
			let id = window.setInterval(() => {
				setCount((p) => {
					return p + 1;
				});
			}, 1000);
			return () => {
				window.clearInterval(id);
			};
		}, [message]);

		const trigger = useEventCallback((oldCount: number) => {
			setIsTriggered(false);
			setMessage(`Closure count was ${oldCount}, new count is ${count}, returning to closure count`);
			setCount(oldCount);
		});


		React.useEffect(() => {
			return () => {
				window.clearTimeout(timeoutRef.current);
			};
		}, []);

		const buttonSet = useTestButtons({
			'Trigger': () => {
				setIsTriggered(true);
				window.clearTimeout(timeoutRef.current);
				timeoutRef.current = window.setTimeout(() => {
					trigger(count);
				}, 2500);
			}
		});

		if (count === 5000) {
			return (
				<TestWrapper>Restart</TestWrapper>
			);
		}

		return (
			<TestWrapper>
				{buttonSet}
				<p>Count: {count}</p>
				<p>{isTriggered ? '...' : message}</p>
			</TestWrapper>
		);
	},
};
