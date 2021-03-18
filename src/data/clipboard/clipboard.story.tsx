import * as React from 'react';
import { decorate } from '@/test/decorate';
import { text, button } from '@storybook/addon-knobs';
import { setClipboard } from './clipboard';

export default { title: 'Data/Clipboard' };

export const TestClipboard = decorate('Clipboard', () => {

	const textToCopy1 = text('Text To Copy', 'Hello, this is text!');
	const textToCopy2 = text('Text To Copy 2', 'And here is some more!');

	button('Copy', () => {
		setClipboard([textToCopy1, textToCopy2]);
	});

	return (
		<>
			<p>{textToCopy1}</p>
			<p>{textToCopy2}</p>
			<textarea rows={6} />
		</>
	);
});