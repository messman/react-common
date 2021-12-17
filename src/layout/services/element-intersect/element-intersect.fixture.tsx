import * as React from 'react';
import { styled } from '@/test/styled';
import { Flex, FlexRoot } from '@/layout/ui/flex/flex';
import { useControlledElementIntersect, ElementIntersect, createThreshold, ElementIntersectOptions, ElementIntersectRelativePosition } from './element-intersect';
import { usePrevious } from '@/utility/previous/previous';
import { useValue } from 'react-cosmos/fixture';
import { TestWrapper } from '@/test/decorate';

export default {
	'Intersect Info': () => {

		const [rootMargin] = useValue('Root Margin', { defaultValue: '0%' });
		const [thresholdSections] = useValue('Threshold Sections', { defaultValue: 0 });
		const [useRootElement] = useValue('Use Root Element', { defaultValue: true });

		const threshold = React.useMemo(() => {
			return createThreshold(thresholdSections);
		}, [thresholdSections]);

		const rootRef = React.useRef<any>(null!);
		const intersectOptions = React.useMemo<ElementIntersectOptions>(() => {
			return {
				rootRef: rootRef,
				rootMargin: rootMargin,
				threshold: threshold
			};
		}, [rootMargin, threshold, useRootElement]);
		console.log('Options', intersectOptions);

		const [targetRef, elementIntersect] = useControlledElementIntersect(intersectOptions, (_) => {
			console.log('Intersect', elementIntersect);
		});
		const previousElementIntersect = usePrevious(elementIntersect);

		return (
			<TestWrapper>
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
			</TestWrapper>
		);
	},
	'Scrollbar Check': () => {
		const [sizePercent] = useValue('Size Percent', { defaultValue: 95 });
		const [rootMargin] = useValue('Root Margin', { defaultValue: '0%' });
		const [thresholdSections] = useValue('Threshold Sections', { defaultValue: 0 });

		const threshold = React.useMemo(() => {
			return createThreshold(thresholdSections);
		}, [thresholdSections]);

		const rootRef = React.useRef<any>(null!);
		const intersectOptions = React.useMemo<ElementIntersectOptions>(() => {
			return {
				rootRef: rootRef,
				rootMargin: rootMargin,
				threshold: threshold
			};
		}, [rootMargin, threshold]);

		const [targetRef, elementIntersect] = useControlledElementIntersect(intersectOptions, (_) => {
			console.log('Intersect', _);
		});

		const isScrolling = !!elementIntersect && elementIntersect.intersectionRatio < 1;

		return (
			<TestWrapper>
				<FlexRoot flexDirection='column'>
					<ScrollContainer ref={rootRef}>
						<ScrollingChild ref={targetRef} sizePercent={sizePercent}>
							<p>Size Percent: {sizePercent.toString()}</p>
							<p>Is Scrolling: {isScrolling.toString()}</p>
						</ScrollingChild>
					</ScrollContainer>
				</FlexRoot>
			</TestWrapper>
		);
	}
};

const scrollContainerHeight = 30;

const ScrollContainer = styled.div`
	height: ${scrollContainerHeight}rem;
	overflow: auto;
	border: 1px solid red;
`;

interface ScrollingChildProps {
	sizePercent: number;
}

const ScrollingChild = styled.div<ScrollingChildProps>`
	height: ${p => Math.round((p.sizePercent / 100) * scrollContainerHeight)}rem;
	background-color: skyblue;
	color: black;
	overflow: auto;
`;

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
	height: 1800px;
	background: rgb(6,169,203);
	background: linear-gradient(180deg, rgba(6,169,203,1) 0%, rgba(9,9,121,1) 100%);
`;

const Target = styled.div`
	width: 600px;
	height: 600px;
	background-color: white;
`;