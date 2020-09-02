import * as React from 'react';
import { useElementIntersect, createThreshold } from '@/layout/services/element-intersect/element-intersect';
import styled, { StyledComponent } from 'styled-components';
import { useElementSize } from '@/layout/services/element-size/element-size';

/*
	This is a sticky component. It tries to fix these issues from simpler 'position: sticky' components:
		- You can't tell when the component goes into 'sticky mode' so that you can change the UI.
		- If you *can* tell when the component goes into 'sticky mode', you are still restricted from changing the height of the UI because that makes scrolling jarring.

	Terminology: 'sticky mode' = sticky render / content, 'non sticky mode' = relative render / content.

	This component tries to fix these problems with some optimizations and hacks.
	The main optimization is to use IntersectionObserver to detect when to go into 'sticky mode', instead of using a scroll listener.

	The main hack is a prop that can take in 'variable-height sticky content':
		- If the sticky is not passed any 'variable-height sticky content', then:
			- What is passed to 'children' is always visible, like the simple sticky.
			- Changing the height just for the sticky content will result in a bad UI (because of animations and/or positioning).

		- If the sticky is passed 'variable-height sticky content', then:
			- The variable-height sticky content *may* be used for the relative render.
			- The zero-height trick is used: the sticky content is always rendered, but is invisible inside a zero-height sticky div.
				- When the sticky render gets to the end of its container and begins to move offscreen, it will 'hang over' onto other UI elements. (See tests.)
					- You can maybe fix this with some selective extra margin/padding in the UI.
			- You can change the sticky content height since it is disconnected from the relative content.
	
	Beyond all this, there can be variation in exactly when we enter 'sticky mode' to show the sticky render. See the enum.
*/

export interface StickyInput {
	direction: 'top' | 'bottom';
	useEarlySticky: boolean;
	thresholdPercent?: number;
	thresholdPixels?: number;
	throttle?: number;
}

export interface StickyOutput {
	input: StickyInput;
	rootRef: React.RefObject<any>;
	containerTargetRef: React.RefObject<any>;
	boundaryTargetRef: React.RefObject<any>;
	relativeContentSizeRef: React.RefObject<any>;
	isSticky: boolean;
	isEarlySticky: boolean;
}

// Default threshold that just triggers on full intersect and first intersect.
const defaultThreshold = createThreshold();

export function useSticky(input: StickyInput): StickyOutput {
	const { direction, thresholdPercent, thresholdPixels, useEarlySticky, throttle } = input;

	const isTop = direction.toLowerCase() === 'top';

	const isCleanedUpRef = React.useRef(false);
	React.useLayoutEffect(() => {
		return () => {
			isCleanedUpRef.current = true;
		};
	}, []);

	// Tracking the sticky state.
	const [isSticky, setIsSticky] = React.useState(false);
	const [isEarlySticky, setIsEarlySticky] = React.useState(false);

	// Track the height of our relative content to affect the intersection bounds (for certain transitions).
	const setRelativeContentHeight = React.useState(-1)[1];
	// Kind of janky - but we only access this height under certain conditions.
	const relativeContentHeightRef = React.useRef<number>(-1);
	const relativeContentHeight = relativeContentHeightRef.current;

	// From top: 0 means instant, 1 means full height.
	let trueThresholdPixels = 0;
	let needsRelativeContentHeight = Number.isFinite(thresholdPercent) && thresholdPercent !== 0;
	if (needsRelativeContentHeight && relativeContentHeight > 0) {
		trueThresholdPixels = thresholdPercent! * relativeContentHeight;
	}
	if (Number.isFinite(thresholdPixels)) {
		trueThresholdPixels += thresholdPixels!;
	}

	const relativeContentSizeRef = useElementSize(throttle || 0, (_, height) => {
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
		setIsSticky(isTop ? intersect.top.isBefore : intersect.bottom.isAfter);
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
		setIsEarlySticky(isTop ? intersect.top.isBefore : intersect.bottom.isAfter);
	});

	return {
		input: input,
		rootRef: rootRef,
		containerTargetRef: containerTargetRef,
		boundaryTargetRef: boundaryTargetRef,
		isSticky: isSticky,
		isEarlySticky: useEarlySticky && isEarlySticky,
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
	const { input, isSticky, relativeContentSizeRef, boundaryTargetRef } = output;
	const { direction, useEarlySticky } = input;

	const isTop = direction === 'top';

	/*
		If we were supplied with a relative render, use it to calculate height (for disappear / carry logic).
		Otherwise, get the height from the sticky content - but know that it's dangerous to do so when you intend to change the sticky content height.
	*/
	let relativeRender: JSX.Element = null!;
	let stickyRender: JSX.Element = null!;
	if (variableHeightStickyContent) {

		if (useEarlySticky) {
			relativeRender = (
				<StickyContainer isZeroHeight={false} isSticky={!isSticky} dataDirection={direction}>
					<div ref={relativeContentSizeRef}>
						{children}
					</div>
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
			<StickyContainer isZeroHeight={true} isSticky={true} dataDirection={direction}>
				{variableHeightStickyContent}
			</StickyContainer>
		);
	}
	else {
		// We don't intend for the height to change.
		stickyRender = (
			<StickyContainer isZeroHeight={false} isSticky={useEarlySticky || isSticky} dataDirection={direction}>
				<div ref={relativeContentSizeRef}>
					{children}
				</div>
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
	isSticky: boolean;
	isZeroHeight: boolean;
}

const StickyContainer = styled.div.attrs<StickyContainerProps>((p) => {
	const { dataDirection, isSticky, isZeroHeight } = p;
	const style: Partial<CSSStyleDeclaration> = {
		[dataDirection]: '0px',
	};
	if (isSticky) {
		style.position = 'sticky';
	}
	if (isZeroHeight) {
		style.height = '0px';
	}

	return {
		style: style
	};
})`` as StyledComponent<'div', any, StickyContainerProps, never>;