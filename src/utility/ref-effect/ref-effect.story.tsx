import * as React from 'react';
import { decorate } from '@/test/decorate';
import { useRefEffectCallback, useRefLayoutEffect } from './ref-effect';
import styled from 'styled-components';
import { boolean } from '@storybook/addon-knobs';
import { getUnique } from '../unique/unique';

export default { title: 'Utility/Ref Effect' };

export const TestRefLayoutEffect = decorate('Ref Layout Effect', () => {

	const showOuter = boolean('Show', false);
	const [showInner, setShowInner] = React.useState(false);

	// Note: This isn't even a good use case, as you don't need the element for cleanup.
	const ref = useRefLayoutEffect((element) => {
		const id = getUnique();
		console.log('adding', id, element);
		setShowInner(true);
		return () => {
			console.log('removing', id, element);
			setShowInner(false);
		};
	}, []);

	if (!showOuter) {
		return <p>Not showing.</p>;
	}

	const innerRender = showInner ? <Inner /> : 'NOT SHOWING INNER.';

	return (
		<Div ref={ref}>
			{innerRender}
		</Div>
	);
});

export const TestRefEffectCallback = decorate('Ref Effect Callback', () => {

	const showOuter = boolean('Show', false);
	const [showInner, setShowInner] = React.useState(false);

	// Note: This isn't even a good use case, as you don't need the element for cleanup.
	const ref = useRefEffectCallback(() => {
		const id = getUnique();
		console.log('adding', id);
		setShowInner(true);
		return () => {
			console.log('removing', id);
			setShowInner(false);
		};
	}, []);

	if (!showOuter) {
		return <p>Not showing.</p>;
	}

	const innerRender = showInner ? <Inner /> : 'NOT SHOWING INNER.';

	return (
		<Div ref={ref}>
			{innerRender}
		</Div>
	);
});

const Div = styled.div`
	position: relative;
	width: 50px;
	height: 50px;
	background-color: deepskyblue;
`;

const Inner = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: darkseagreen;
`;
