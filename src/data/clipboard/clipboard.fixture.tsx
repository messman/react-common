import * as React from 'react';
import { TestWrapper, useTestButtons } from '@/test/decorate';
import { setClipboard } from './clipboard';
import { useValue } from 'react-cosmos/fixture';

export default () => {

	const startDate = Date.now();

	const [textToCopy1] = useValue('Text To Copy', { defaultValue: 'Hello, this is text!' });
	const [textToCopy2] = useValue('Text To Copy 2', { defaultValue: 'And here is some more!' });
	const [lastResult, setLastResult] = React.useState<boolean | null>(null);

	const buttons = useTestButtons({
		'Copy': async () => {
			const result = await setClipboard([textToCopy1, textToCopy2, (Date.now() - startDate).toString()]);
			setLastResult(result);
		},
	});

	return (
		<TestWrapper>
			{buttons}
			<p>{textToCopy1}</p>
			<p>{textToCopy2}</p>
			<p>Last Result: {lastResult === null ? '(none)' : (lastResult ? 'Success!' : 'Failure (see console)')}</p>
			<textarea rows={6} />
		</TestWrapper>
	);
};