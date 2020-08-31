import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled } from '@/test/styled';
import { number, text, boolean } from '@storybook/addon-knobs';
import { Flex, FlexRoot } from '@/layout/ui/flex/flex';
import { useControlledElementIntersect, ElementIntersect, createThreshold, ElementIntersectOptions } from './element-intersect';
import { usePrevious } from '@/utility/previous/previous';

export default { title: 'Layout/Services/Element Intersect' };

export const TestElementIntersect = decorate('Element Intersect', () => {

	const rootMargin = text('Root Margin', '0%');
	const thresholdRatioDistance = number('Threshold Ratio Distance', 0, { min: 0, max: 1, step: .05 });
	const useRootElement = boolean('Use Root Element', false);

	const threshold = React.useMemo(() => {
		return createThreshold(thresholdRatioDistance);
	}, [thresholdRatioDistance]);

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
				<p><strong>{getElementIntersectStatus(elementIntersect)}</strong></p>
				<p><em>Previous: {getElementIntersectStatus(previousElementIntersect || null)}</em></p>
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

function getElementIntersectStatus(elementIntersect: ElementIntersect | null): string {
	if (!elementIntersect) {
		return '';
	}
	const { isIntersecting, intersectionRatio, boundingClientRect, intersectionRect, rootBounds } = elementIntersect;

	const isIntersectingText = isIntersecting ? 'Yes' : 'No';
	const intersectionRatioText = ((intersectionRatio * 100).toFixed(1) || 0) + '%';

	const boundingClientRectText = `target: ${getDOMRectStatus(boundingClientRect)}`;
	const intersectionRectText = `intersectionRect: ${getDOMRectStatus(intersectionRect)}`;
	const rootBoundsText = `rootBounds: ${getDOMRectStatus(rootBounds)}`;

	return [isIntersectingText, intersectionRatioText, boundingClientRectText, intersectionRectText, rootBoundsText].join(' | ');
}

function getDOMRectStatus(rect: DOMRectReadOnly | null): string {
	if (!rect) {
		return 'unknown';
	}

	const { x, y, width, height } = rect;
	return `(${x}, ${y}) (${width} x ${height})`;
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