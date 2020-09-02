import * as React from 'react';
import { useElementIntersect, createThreshold } from '@/layout/services/element-intersect/element-intersect';
import styled, { StyledComponent } from 'styled-components';
import { useElementSize } from '@/layout/services/element-size/element-size';
import { FlexColumn } from '../flex/flex';

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


export enum StickyTransition {
	/**
	 * Applies the sticky render as soon as possible.
	 * 
	 * Relative content and sticky content should be the same height.
	 * Thus, don't provide variable-height sticky content.
	*/
	instant,
	/**
	 * Doesn't apply the sticky render until the relative render height is crossed (the relative render has completely disappeared out of view).
	 */
	disappear,
	/**
	 * The relative render will stick until its height is crossed. Then the sticky render will apply.
	*/
	carry,
	/**
	 * Like the disappear transition, but using the sticky content height instead.
	 * Made for scenarios where the sticky content height is different - otherwise, it works like the instant transition.
	 * 
	 * If no variable-height sticky content is provided, acts like 'instant'.
	 * */
	disappearToVariableSticky,
	/**
	 * Like the carry transition, but using the sticky content height instead.
	 * Made for scenarios where the sticky content height is different - otherwise, it works like the instant transition.
	 * 
	 * If no variable-height sticky content is provided, acts like 'instant'.
	 * */
	carryToVariableSticky
}

export interface StickyInput {
	direction: 'top' | 'bottom';
	transition: StickyTransition;
}

export interface StickyOutput {
	input: StickyInput;
	intersectTargetRef: React.RefObject<any>;
	intersectRootRef: React.RefObject<any>;
	isSticky: boolean;
	relativeContentSizeRef: React.RefObject<any>;
	variableStickyContentSizeRef: React.RefObject<any>;
}

const threshold = createThreshold();

export function useSticky(input: StickyInput): StickyOutput {
	const { direction, transition } = input;
	const isTop = direction.toLowerCase() === 'top';
	const needsRelativeContentHeight = transition !== StickyTransition.instant;
	const needsVariableStickyContentHeight = needsRelativeContentHeight && (transition === StickyTransition.disappearToVariableSticky || transition === StickyTransition.carryToVariableSticky);

	// Tracking the sticky state.
	const [isSticky, setIsSticky] = React.useState(false);

	// Track the height of our relative content to affect the intersection bounds (for certain transitions).
	const [relativeContentHeight, setRelativeContentHeight] = React.useState(-1);
	// Track the height of our sticky content to affect the intersection bounds (for certain transitions).
	const [variableStickyContentHeight, setVariableStickyContentHeight] = React.useState(-1);

	const relativeContentSizeRef = useElementSize(0, (_, height) => {
		// Only update if we actually need this information.
		if (needsRelativeContentHeight) {
			setRelativeContentHeight(height);
		}
	});

	const variableStickyContentSizeRef = useElementSize(0, (_, height) => {
		// Only update if we actually need this information.
		if (needsVariableStickyContentHeight) {
			setVariableStickyContentHeight(height);
		}
	});

	// For non-instant transitions, change the margin at which the root will intersect with the target.
	// Make it equal to the target's height, so intersection only triggers after the element is gone.
	let rootMargin: string | undefined = undefined;
	if (relativeContentHeight > 0 && needsRelativeContentHeight) {

		// Default to zero in case we don't have sticky content height.
		let heightOffset = 0;

		if (transition === StickyTransition.disappear || transition === StickyTransition.carry) {
			// For the disappear and carry transitions, we just look at the relative content height.
			heightOffset = relativeContentHeight;
		}
		else if (variableStickyContentHeight > 0 && needsVariableStickyContentHeight) {
			// For the other transitions, use the space between the relative content height and the sticky content height.
			heightOffset = relativeContentHeight - variableStickyContentHeight;
		}

		if (isTop) {
			rootMargin = `${heightOffset}px 0px 0px 0px`;
		}
		else {
			rootMargin = `0px 0px ${heightOffset}px 0px`;
		}
	}

	// Check for intersections between two of our ancestors.
	// The target should be a direct parent; the root should be a scroll container.
	const [intersectTargetRef, intersectRootRef] = useElementIntersect({
		useRoot: true,
		rootMargin: rootMargin,
		threshold: threshold
	}, (intersect) => {
		if (!intersect) {
			return;
		}
		/*
			Sticky is not just intersecting.
			If we are using a sticky header, the header should be sticky whenever the target area is above the root - 
			even if that means the target area is far above the root and no longer intersecting.
		*/
		setIsSticky(isTop ? intersect.top.isBefore : intersect.bottom.isAfter);
	});

	return {
		input: input,
		intersectTargetRef: intersectTargetRef,
		intersectRootRef: intersectRootRef,
		isSticky: isSticky,
		relativeContentSizeRef: relativeContentSizeRef,
		variableStickyContentSizeRef: variableStickyContentSizeRef,
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
	const { input, isSticky, relativeContentSizeRef, variableStickyContentSizeRef } = output;
	const { direction, transition } = input;

	const isTop = direction === 'top';
	const isCarry = transition === StickyTransition.carry || transition === StickyTransition.carryToVariableSticky;

	/*
		If we were supplied with a relative render, use it to calculate height (for disappear / carry logic).
		Otherwise, get the height from the sticky content - but know that it's dangerous to do so when you intend to change the sticky content height.
	*/
	let relativeRender: JSX.Element = null!;
	let stickyRender: JSX.Element = null!;
	if (variableHeightStickyContent) {

		if (isCarry) {
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


		// Use zero-height container to hide the sticky content until it's needed.
		const justifyContent = isTop ? 'flex-start' : 'flex-end';
		stickyRender = (
			<StickyContainer isZeroHeight={true} isSticky={true} dataDirection={direction}>
				<OverflowContentContainer justifyContent={justifyContent} isVisible={isSticky}>
					<div ref={variableStickyContentSizeRef}>
						{variableHeightStickyContent}
					</div>
				</OverflowContentContainer>
			</StickyContainer>
		);
	}
	else {
		// We don't intend for the height to change.
		stickyRender = (
			<StickyContainer isZeroHeight={false} isSticky={isCarry || isSticky} dataDirection={direction}>
				<div ref={relativeContentSizeRef}>
					{children}
				</div>
			</StickyContainer>
		);
	}

	const upperRender = isTop ? stickyRender : relativeRender;
	const lowerRender = isTop ? relativeRender : stickyRender;

	return (
		<>
			{upperRender}
			{lowerRender}
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
		position: isSticky ? 'sticky' : 'relative',
	};
	if (isZeroHeight) {
		style.height = '0px';
	}

	return {
		style: style
	};
})`` as StyledComponent<'div', any, StickyContainerProps, never>;

interface OverflowContentContainerProps {
	isVisible: boolean;
}

// Use a zero-height flex column and use justify-content to control whether the children render above or below the 'line'.
const OverflowContentContainer = styled(FlexColumn) <OverflowContentContainerProps>`
	height: 0;
	overflow: ${p => p.isVisible ? 'visible' : 'hidden'};
`;