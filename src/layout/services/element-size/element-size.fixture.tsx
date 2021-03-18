import * as React from 'react';
import { styled, keyframes } from '@/test/styled';
import { useControlledElementSize } from './element-size';
import { useValue } from 'react-cosmos/fixture';
import { TestWrapper, wrap } from '@/test/decorate';

export default {
	'Animating': wrap(() => {

		const [throttle] = useValue('Throttle', { defaultValue: 0 });
		const [show] = useValue('Show', { defaultValue: true });

		const [ref, size] = useControlledElementSize(throttle);

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
	}),
	'Resizing Window': () => {

		const [throttle] = useValue('Throttle', { defaultValue: 0 });

		const [ref, size] = useControlledElementSize(throttle);

		const width = Math.round(size.width) - 20;
		const height = Math.round(size.height) - 20;

		return (
			<TestWrapper>

				<AbsoluteContainer ref={ref}>
					<ResizableDiv width={width} height={height}>
						<p>This green area is being resized programmatically to match the inside of the blue area, which is controlled by CSS.</p>
						<p>width: {width}</p>
						<p>height: {height}</p>
					</ResizableDiv>
				</AbsoluteContainer>
			</TestWrapper>
		);
	}
};

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
