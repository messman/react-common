import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled } from '@/test/styled';
import { number } from '@storybook/addon-knobs';
import { Flex } from '@/layout/ui/flex';

export default { title: 'Layout/Services/Element Scroll' };

export const TestAnimatingElementSize = decorate('Animating', () => {

	const heightFactor = number('Height Factor', 4);

	return (
		<Container>
			<Scroller heightFactor={heightFactor}>
				<p>Top!</p>
				<Flex />
				<p>Bottom!</p>
			</Scroller>
		</Container>
	);

	return (
		<p>Not showing.</p>
	);
});

const Container = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	overflow: auto;
`;

interface ScrollerProps {
	heightFactor: number;
}

const Scroller = styled.div<ScrollerProps>`
	position: flex;
	flex-direction: column;
	width: 100%;
	height: ${p => p.heightFactor * 100}%;
	overflow: auto;
`;