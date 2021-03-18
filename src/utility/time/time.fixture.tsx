import * as React from 'react';
import { seconds } from './time';
import { useValue } from 'react-cosmos/fixture';
import { TestWrapper } from '@/test/decorate';

export default () => {

	const secondsUntil = seconds(30);
	const [count, setCount] = useValue('Count', { defaultValue: 45 });
	return (
		<TestWrapper>
			<button onClick={() => setCount(count + 1)} >Click!!!! {count.toString()} {secondsUntil.toString()}</button>
		</TestWrapper>
	);
};