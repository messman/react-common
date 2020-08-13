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
	display: flex;
	flex-direction: column;
	width: 100%;
	height: ${p => p.heightFactor * 100}%;
	background: rgb(6,169,203);
	background: linear-gradient(180deg, rgba(6,169,203,1) 0%, rgba(9,9,121,1) 100%);
`;