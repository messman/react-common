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
	1. We actually use IntersectionObserver twice, with zero-height divs. This allows us to customize how the sticky will look at different scroll points.
		- These points can be customized and then used in logic by the consumer. They are creatively called 'First' and 'Second'. 
	2. To support changing the height, you can pass in a prop of 'variable content'. If passed:
		- The variable content is placed in a zero-height sticky div. The consuming component should use logic to choose to render / not render the variable content.
			- When the variable content gets to the end of its container and begins to move offscreen, it will 'hang over' onto other UI elements. (See tests.)
				- You can maybe fix this with some selective extra margin/padding in the UI.
		- You can change the variable content height since it is disconnected from the relative content.
*/

export interface StickyInput {
	/**
	 * Default: 'top'.
	 * Whether the sticky will be a header (top) or a footer (bottom).
	 */
	direction: 'top' | 'bottom';
	/**
	 * Default: 0. [0,Infinity)
	 * Factor is relative to the height of the child content.
	 * 0 is the start of the child content; .5 is half its height; 1 is its full height.
	 */
	firstFactor: number;
	/**
	 * Default: 0. (-Infinity,Infinity)
	 * Pixels are added to the factor to fine-tune the total distance.
	 */
	firstPixels: number;
	/**
	 * Default: 0. [0,Infinity)
	 * Factor is relative to the height of the child content.
	 * 0 is the start of the child content; .5 is half its height; 1 is its full height.
	 */
	secondFactor: number;
	/**
	 * Default: 0. (-Infinity,Infinity)
	 * Pixels are added to the factor to fine-tune the total distance.
	 */
	secondPixels: number;
	/**
	 * Default: 0.
	 * Throttle for detecting changes in height of the sticky's child content.
	 */
	throttle: number;
}

const defaultStickyInput: StickyInput = {
	// See comments above
	direction: 'top',
	firstFactor: 0,
	firstPixels: 0,
	secondFactor: 0,
	secondPixels: 0,
	throttle: 0
};


export interface StickyOutput {
	input: StickyInput;
	rootRef: React.RefObject<any>;
	isAtFirst: boolean;
	isAtSecond: boolean;

	// "Private"
	firstTargetRef: React.RefObject<any>;
	secondTargetRef: React.RefObject<any>;
	relativeContentSizeRef: React.RefObject<any>;
}

// Default threshold that just triggers on full intersect and first intersect.
const defaultThreshold = createThreshold();

export function useSticky(input: Partial<StickyInput>): StickyOutput {
	const safeInput = Object.assign({}, defaultStickyInput, input);
	const { direction, firstFactor, firstPixels, secondFactor, secondPixels, throttle } = safeInput;

	const isTop = direction.toLowerCase() === 'top';

	const isCleanedUpRef = React.useRef(false);
	React.useLayoutEffect(() => {
		return () => {
			isCleanedUpRef.current = true;
		};
	}, []);

	// Tracking the sticky state.
	const [isAtFirst, setIsAtFirst] = React.useState(false);
	const [isAtSecond, setIsAtSecond] = React.useState(false);

	// Track the height of our relative content to affect the intersection bounds (for certain transitions).
	const [relativeContentHeight, setRelativeContentHeight] = React.useState(-1);

	const relativeContentSizeRef = useElementSize(throttle, (_, height) => {
		if (isCleanedUpRef.current) {
			return;
		}
		setRelativeContentHeight(height);
	});

	// If not set, we use the window.
	const rootRef = React.useRef<any>(null);

	const firstTargetRef = useElementIntersect({
		rootRef: rootRef,
		rootMargin: calculateRootMargin(isTop, relativeContentHeight, firstFactor, firstPixels),
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
		setIsAtFirst(isTop ? intersect.top.isBefore : intersect.bottom.isAfter);
	});

	const secondTargetRef = useElementIntersect({
		rootRef: rootRef,
		rootMargin: calculateRootMargin(isTop, relativeContentHeight, secondFactor, secondPixels),
		threshold: defaultThreshold
	}, (intersect) => {
		if (!intersect || isCleanedUpRef.current) {
			return;
		}
		setIsAtSecond(isTop ? intersect.top.isBefore : intersect.bottom.isAfter);
	});

	return {
		input: safeInput,
		rootRef: rootRef,
		isAtFirst: isAtFirst || isAtSecond, // Safety measure
		isAtSecond: isAtSecond,

		firstTargetRef: firstTargetRef,
		secondTargetRef: secondTargetRef,
		relativeContentSizeRef: relativeContentSizeRef,
	};
}

function calculateRootMargin(isTop: boolean, height: number, factor: number, pixels: number): string | undefined {
	// From top: 0 means instant, 1 means full height.
	let truePixels = 0;
	if (Number.isFinite(factor) && factor !== 0 && height > 0) {
		truePixels = factor! * height;
	}
	if (Number.isFinite(pixels)) {
		truePixels += pixels!;
	}
	// For non-instant transitions, change the margin at which the root will intersect with the target.
	// Make it equal to the target's height, for example, so intersection only triggers after the element is gone.
	let rootMargin: string | undefined = undefined;
	if (truePixels !== 0) {
		rootMargin = isTop ? `${truePixels}px 0px 0px 0px` : `0px 0px ${truePixels}px 0px`;
	}
	return rootMargin;
}

export interface StickyProps {
	output: StickyOutput;
	/**
	 * If provided, some transitions may use a different height for the sticky content. See implementation notes.
	 */
	variableContent?: JSX.Element | null;
	/**
	 * Sets the sticky behavior for the child content. Does not affect the variable content, which is always sticky.
	 */
	isSticky?: boolean;
}

export const Sticky: React.FC<StickyProps> = (props) => {
	const { output, variableContent, isSticky, children } = props;
	const { input, relativeContentSizeRef, firstTargetRef, secondTargetRef } = output;
	const { direction } = input;

	const isTop = direction === 'top';

	const relativeRender = (
		<StickyContainer ref={relativeContentSizeRef} isZeroHeight={false} isPositionSticky={!!isSticky} dataDirection={direction}>
			{children}
		</StickyContainer>
	);

	let variableRender: JSX.Element | null = null;
	if (variableContent) {
		variableRender = (
			<StickyContainer isZeroHeight={true} isPositionSticky={true} dataDirection={direction}>
				{variableContent}
			</StickyContainer>
		);
	}

	const intersectRender = (
		<>
			<div ref={firstTargetRef} />
			<div ref={secondTargetRef} />
		</>
	);

	if (isTop) {
		return (
			<>
				{intersectRender}
				{variableRender}
				{relativeRender}
			</>
		);
	}
	return (
		<>
			{relativeRender}
			{variableRender}
			{intersectRender}
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
	const style: Partial<CSSStyleDeclaration> = {};
	if (isPositionSticky) {
		style.position = 'sticky';
		style[dataDirection] = '0px';
	}
	if (isZeroHeight) {
		style.height = '0px';

		if (dataDirection === 'bottom') {
			style.display = 'flex';
			style.flexDirection = 'column';
			style.justifyContent = 'flex-end';
		}
	}
	return {
		style: style
	};
})`` as StyledComponent<'div', any, StickyContainerProps, never>;