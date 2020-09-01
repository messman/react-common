import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled } from '@/test/styled';
import { number, text, boolean } from '@storybook/addon-knobs';
import { Flex, FlexRoot } from '@/layout/ui/flex/flex';
import { useControlledElementIntersect, ElementIntersect, createThreshold, ElementIntersectOptions, ElementIntersectRelativePosition } from './element-intersect';
import { usePrevious } from '@/utility/previous/previous';

export default { title: 'Layout/Services/Element Intersect' };

export const TestElementIntersect = decorate('Element Intersect', () => {

	const rootMargin = text('Root Margin', '0%');
	const thresholdSections = number('Threshold Sections', 0, { min: 1, max: 20, step: 2 });
	const useRootElement = boolean('Use Root Element', true);

	const threshold = React.useMemo(() => {
		return createThreshold(thresholdSections);
	}, [thresholdSections]);

	const intersectOptions = React.useMemo<ElementIntersectOptions>(() => {
		return {
			useRoot: useRootElement,
			rootMargin: rootMargin,
			threshold: threshold
		};
	}, [rootMargin, threshold, useRootElement]);

	const [targetRef, elementIntersect, rootRef] = useControlledElementIntersect(intersectOptions, (_) => {
		//console.log('Intersect', elementIntersect);
	});
	const previousElementIntersect = usePrevious(elementIntersect);

	return (
		<>
			<FlexRoot flexDirection='column'>
				<p>{JSON.stringify(threshold)}</p>
				<ElementIntersectStatus intersect={elementIntersect} />
				<hr />
				<em><ElementIntersectStatus intersect={previousElementIntersect} /></em>
				<FlexContainer ref={rootRef}>
					<Scroller>
						<Flex />
						<Target ref={targetRef}>
							<p>Top!</p>
						</Target>
						<Flex />
					</Scroller>
				</FlexContainer>
			</FlexRoot>
		</>
	);
});

interface ElementIntersectStatusProps {
	intersect: ElementIntersect | null | undefined;
}

const ElementIntersectStatus: React.FC<ElementIntersectStatusProps> = (props) => {
	const intersect = props.intersect;
	if (!intersect) {
		return <p>No Intersect Information.</p>;
	}

	const { isIntersecting, intersectionRatio, boundingClientRect, intersectionRect, rootBounds, top, right, left, bottom } = intersect;

	const isIntersectingText = isIntersecting ? 'Yes' : 'No';
	const intersectionRatioText = ((intersectionRatio * 100).toFixed(1) || 0) + '%';
	const visibleText = [getRelativePositionStatus('top', top), getRelativePositionStatus('bottom', bottom), getRelativePositionStatus('left', left), getRelativePositionStatus('right', right)].filter(x => !!x).join(', ');

	return (
		<>
			<p><strong>{isIntersectingText} {intersectionRatioText} ({visibleText})</strong></p>
			<p>target: {getDOMRectStatus(boundingClientRect)}</p>
			<p>intersectionRect: {getDOMRectStatus(intersectionRect)}</p>
			<p>rootBounds: {getDOMRectStatus(rootBounds)}</p>
		</>
	);
};

function getRelativePositionStatus(name: string, position: ElementIntersectRelativePosition): string {
	const positionText = [position.isBefore ? '^' : '', position.isIntersecting ? 'X' : '', position.isAfter ? 'V' : ''].join('');
	if (positionText) {
		return `${name} ${positionText}`;
	}
	return '';
}

function getDOMRectStatus(rect: DOMRectReadOnly | null): string {
	if (!rect) {
		return 'unknown';
	}

	const { x, y, width, height, top, bottom, left, right } = rect;
	return `x: ${x}, y: ${y}, w: ${width}, h: ${height}, t: ${top}, b: ${bottom}, l: ${left}, r: ${right}`;
}

const FlexContainer = styled(Flex)`
	overflow: auto;
`;

const Scroller = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 300%;
	background: rgb(6,169,203);
	background: linear-gradient(180deg, rgba(6,169,203,1) 0%, rgba(9,9,121,1) 100%);
`;

const Target = styled.div`
	width: 600px;
	height: 600px;
	background-color: white;
`;