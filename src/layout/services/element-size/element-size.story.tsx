import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled, keyframes } from '@/test/styled';
import { useElementSize } from './element-size';
import { boolean } from '@storybook/addon-knobs';

export default { title: 'Layout/Services/Element Size' };

export const TestAnimatingElementSize = decorate('Animating', () => {

	const show = boolean('Show', true);

	const [ref, size] = useElementSize();

	const sizeOutput = JSON.stringify({
		width: Math.round(size.width),
		height: Math.round(size.height)
	}, null, 3);

	if (show) {
		return (
			<Margin>
				<ResizingContainer ref={ref}>
					<Margin>
						<pre>
							{sizeOutput}
						</pre>
					</Margin>
				</ResizingContainer>
			</Margin>
		);
	}

	return (
		<p>Not showing.</p>
	);
});

const resizeAnimation = keyframes`
	0% {
		width: 400px;
		height: 400px;
	}

	30% {
		width: 460px;
		height: 300px;
	}
	40% {
		width: 460px;
		height: 300px;
	}

	60% {
		width: 200px;
		height: 200px;
	}
	70% {
		width: 200px;
		height: 200px;
	}

	90% {
		width: 400px;
		height: 400px;
	}
	100% {
		width: 400px;
		height: 400px;
	}
`;

const Margin = styled.div`
	margin: 1rem;
`;

const ResizingContainer = styled.div`
	overflow: auto;
	background-color: skyblue;
	animation: ${resizeAnimation} 5000ms infinite;
	color: black;
`;

export const TestResizingWindowElementSize = decorate('Resizing Window', () => {

	const [ref, size] = useElementSize();

	const width = Math.round(size.width) - 20;
	const height = Math.round(size.height) - 20;

	return (
		<AbsoluteContainer ref={ref}>
			<ResizableDiv width={width} height={height}>
				<p>This green area is being resized programmatically to match the inside of the blue area, which is controlled by CSS.</p>
				<p>width: {width}</p>
				<p>height: {height}</p>
			</ResizableDiv>
		</AbsoluteContainer>
	);
});

const AbsoluteContainer = styled.div`
	position: absolute;
	top: 2rem;
	left: 2rem;
	right: 2rem;
	bottom: 2rem;
	background-color: skyblue;
`;

interface ResizableDivProps {
	width: number;
	height: number;
}

const ResizableDiv = styled.div<ResizableDivProps>`
	overflow: auto;
	margin-top: 10px;
	margin-left: 10px;
	width: ${p => p.width}px;
	height: ${p => p.height}px;
	background-color: seagreen;
`;
