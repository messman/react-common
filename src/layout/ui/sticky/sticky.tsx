import * as React from 'react';
import { useElementIntersect, createThreshold } from '@/layout/services/element-intersect/element-intersect';
import styled, { StyledComponent } from 'styled-components';
import { useElementSize } from '@/layout/services/element-size/element-size';

/*
	This is a sticky component. It tries to fix these issues from simpler 'position: sticky' components:
		- You can't tell when the component goes into 'sticky mode' so that you can change the UI.
		- If you *can* tell when the component goes into 'sticky mode', you are still restricted from changing the height of the UI because that makes scrolling jarring.

	This component tries to fix these problems with some optimizations and hacks.
	The main optimization is to use IntersectionObserver to detect when to go into 'sticky mode', instead of using a scroll listener.
	IntersectionObserver doesn't run in the main thread.

	There are some hacks:
	1. We actually use IntersectionObserver twice - once on the container of the sticky, and again on the border of sticky itself (zero-height div).
		This allows us to customize the transition into sticky mode for smoothness.
	2. To support changing the height, you can pass in a prop of your 'variable-height sticky content':
		- If the sticky is not passed any 'variable-height sticky content', then:
			- What is passed to 'children' is always visible, like the simple sticky.
			- Changing the height just for the sticky content will result in a bad UI (because of animations and/or positioning).
		- If the sticky is passed 'variable-height sticky content', then:
			- The variable-height sticky content *may* be used for the relative render.
			- A zero-height-div trick is used: the sticky content is always rendered, but is invisible inside a zero-height sticky div.
				- When the sticky render gets to the end of its container and begins to move offscreen, it will 'hang over' onto other UI elements. (See tests.)
					- You can maybe fix this with some selective extra margin/padding in the UI.
			- You can change the sticky content height since it is disconnected from the relative content.


	Terminology:
		- Boundary: basically, the area where it would be valid for the sticky to be in 'position: sticky'.
		- Threshold: the custom spot where we can specify the 'position: sticky' to be applied or just for us to be notified.
*/

export interface StickyInput {
	/**
	 * Default: 'top'.
	 * Whether the sticky will be a header (top) or a footer (bottom).
	 */
	direction: 'top' | 'bottom';
	/**
	 * Default: true.
	 * If true, behaves like 'position: sticky'; the sticky will stick 
	 * to its container at the boundary, before we are notified of the threshold.
	 */
	isStickyBeforeThreshold: boolean;
	/**
	 * Default: 0.
	 * Factor is relative to the height of the child content of the sticky.
	 * 0 means the threshold is the same as the boundary.
	 * .5 means the threshold is at half the height of the sticky child content.
	 * 1 means the threshold is met after the sticky is entirely out of view.
	 */
	thresholdFactor: number;
	/**
	 * Default: 0.
	 * Pixels are added to the threshold factor to fine-tune the total threshold distance.
	 * May be positive or negative.
	 */
	thresholdPixels: number;
	/**
	 * Default: 0.
	 * Throttle for detecting changes in height of the sticky's child content.
	 */
	throttle: number;
}

const defaultStickyInput: StickyInput = {
	// See comments above
	direction: 'top',
	isStickyBeforeThreshold: true,
	thresholdFactor: 0,
	thresholdPixels: 0,
	throttle: 0
};


export interface StickyOutput {
	input: StickyInput;
	rootRef: React.RefObject<any>;
	containerTargetRef: React.RefObject<any>;
	boundaryTargetRef: React.RefObject<any>;
	relativeContentSizeRef: React.RefObject<any>;
	isAtBoundary: boolean;
	isAtThreshold: boolean;
}

// Default threshold that just triggers on full intersect and first intersect.
const defaultThreshold = createThreshold();

export function useSticky(input: Partial<StickyInput>): StickyOutput {
	const safeInput = Object.assign({}, defaultStickyInput, input);
	const { direction, thresholdFactor, thresholdPixels, throttle } = safeInput;

	const isTop = direction.toLowerCase() === 'top';

	const isCleanedUpRef = React.useRef(false);
	React.useLayoutEffect(() => {
		return () => {
			isCleanedUpRef.current = true;
		};
	}, []);

	// Tracking the sticky state.
	const [isAtBoundary, setIsAtBoundary] = React.useState(false);
	const [isAtThreshold, setIsAtThreshold] = React.useState(false);

	// Track the height of our relative content to affect the intersection bounds (for certain transitions).
	const setRelativeContentHeight = React.useState(-1)[1];
	// Kind of janky - but we only access this height under certain conditions.
	const relativeContentHeightRef = React.useRef<number>(-1);
	const relativeContentHeight = relativeContentHeightRef.current;

	// From top: 0 means instant, 1 means full height.
	let trueThresholdPixels = 0;
	let needsRelativeContentHeight = Number.isFinite(thresholdFactor) && thresholdFactor !== 0;
	if (needsRelativeContentHeight && relativeContentHeight > 0) {
		trueThresholdPixels = thresholdFactor! * relativeContentHeight;
	}
	if (Number.isFinite(thresholdPixels)) {
		trueThresholdPixels += thresholdPixels!;
	}

	const relativeContentSizeRef = useElementSize(throttle, (_, height) => {
		if (isCleanedUpRef.current) {
			return;
		}

		// Only update if we actually need this information.
		if (needsRelativeContentHeight) {
			setRelativeContentHeight(height);
		}
		relativeContentHeightRef.current = height;
	});

	// For non-instant transitions, change the margin at which the root will intersect with the target.
	// Make it equal to the target's height, so intersection only triggers after the element is gone.
	let rootMargin: string | undefined = undefined;
	if (trueThresholdPixels !== 0) {
		rootMargin = isTop ? `${trueThresholdPixels}px 0px 0px 0px` : `0px 0px ${trueThresholdPixels}px 0px`;
	}

	// If not set, we use the window.
	const rootRef = React.useRef<any>(null);

	// Check for intersections between two of our ancestors.
	// The target should be a direct parent; the root should be a scroll container.
	const containerTargetRef = useElementIntersect({
		rootRef: rootRef,
		rootMargin: rootMargin,
		threshold: defaultThreshold
	}, (intersect) => {
		if (!intersect || isCleanedUpRef.current) {
			return;
		}
		/*
			Sticky is not just intersecting.
			If we are using a sticky header, the header should be sticky whenever the target area is above the root - 
			even if that means the target area is far above the root and no longer intersecting.
		*/
		setIsAtThreshold(isTop ? intersect.top.isBefore : intersect.bottom.isAfter);
	});

	// This end target is a zero-height div that sits above/below our sticky component, to fill in a gap of knowledge in the intersection above.
	// This allows us to know when the relative render has intersected with the root.
	const boundaryTargetRef = useElementIntersect({
		rootRef: rootRef,
		rootMargin: undefined,
		threshold: defaultThreshold
	}, (intersect) => {
		if (!intersect || isCleanedUpRef.current) {
			return;
		}
		setIsAtBoundary(isTop ? intersect.top.isBefore : intersect.bottom.isAfter);
	});

	return {
		input: safeInput,
		rootRef: rootRef,
		containerTargetRef: containerTargetRef,
		boundaryTargetRef: boundaryTargetRef,
		isAtBoundary: isAtBoundary,
		isAtThreshold: isAtThreshold,
		relativeContentSizeRef: relativeContentSizeRef,
	};
}

export interface StickyProps {
	output: StickyOutput;
	/**
	 * If provided, some transitions may use a different height for the sticky content. See implementation notes.
	 */
	variableHeightStickyContent?: JSX.Element | null;
}

export const Sticky: React.FC<StickyProps> = (props) => {
	const { output, variableHeightStickyContent, children } = props;
	const { input, isAtThreshold, relativeContentSizeRef, boundaryTargetRef } = output;
	const { direction, isStickyBeforeThreshold } = input;

	const isTop = direction === 'top';

	/*
		If we were supplied with a relative render, use it to calculate height (for disappear / carry logic).
		Otherwise, get the height from the sticky content - but know that it's dangerous to do so when you intend to change the sticky content height.
	*/
	let relativeRender: JSX.Element = null!;
	let stickyRender: JSX.Element = null!;
	if (variableHeightStickyContent) {
		if (isStickyBeforeThreshold) {
			relativeRender = (
				<StickyContainer ref={relativeContentSizeRef} isZeroHeight={false} isPositionSticky={!isAtThreshold} dataDirection={direction}>
					{children}
				</StickyContainer>
			);
		}
		else {
			relativeRender = (
				<div ref={relativeContentSizeRef}>
					{children}
				</div>
			);
		}

		stickyRender = (
			<StickyContainer isZeroHeight={true} isPositionSticky={true} dataDirection={direction}>
				{variableHeightStickyContent}
			</StickyContainer>
		);
	}
	else {
		// We don't intend for the height to change.
		stickyRender = (
			<StickyContainer ref={relativeContentSizeRef} isZeroHeight={false} isPositionSticky={isStickyBeforeThreshold || isAtThreshold} dataDirection={direction}>
				{children}
			</StickyContainer>
		);
	}
	const boundaryRender = <div ref={boundaryTargetRef} />;

	if (isTop) {
		return (
			<>
				{boundaryRender}
				{stickyRender}
				{relativeRender}
			</>
		);
	}
	return (
		<>
			{relativeRender}
			{stickyRender}
			{boundaryRender}
		</>
	);
};

interface StickyContainerProps {
	dataDirection: 'top' | 'bottom';
	isPositionSticky: boolean;
	isZeroHeight: boolean;
}

const StickyContainer = styled.div.attrs<StickyContainerProps>((p) => {
	const { dataDirection, isPositionSticky, isZeroHeight } = p;
	const style: Partial<CSSStyleDeclaration> = {
		[dataDirection]: '0px',
	};
	if (isPositionSticky) {
		style.position = 'sticky';
	}
	if (isZeroHeight) {
		style.height = '0px';
	}

	return {
		style: style
	};
})`` as StyledComponent<'div', any, StickyContainerProps, never>;