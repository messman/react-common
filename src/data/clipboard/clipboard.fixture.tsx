import * as React from 'react';
import { TestWrapper, useTestButtons } from '@/test/decorate';
import { setClipboard } from './clipboard';
import { useValue } from 'react-cosmos/fixture';

export default () => {

	const [textToCopy1] = useValue('Text To Copy', { defaultValue: 'Hello, this is text!' });
	const [textToCopy2] = useValue('Text To Copy 2', { defaultValue: 'And here is some more!' });

	const button = useTestButtons({
		'Copy': () => {
			setClipboard([textToCopy1, textToCopy2]);
		}
	});

	return (
		<TestWrapper>
			{button}
			<p>{textToCopy1}</p>
			<p>{textToCopy2}</p>
			<textarea rows={6} />
		</TestWrapper>
	);
};