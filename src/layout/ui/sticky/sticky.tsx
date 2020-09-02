import * as React from 'react';
import { useElementIntersect, createThreshold } from '@/layout/services/element-intersect/element-intersect';
import styled, { StyledComponent } from 'styled-components';
import { useControlledElementSize } from '@/layout/services/element-size/element-size';
import { FlexColumn } from '../flex/flex';

/*
	This is a sticky component. It tries to fix these issues from simpler 'position: sticky' components:
	- You can't tell when the component goes into 'sticky mode' so that you can change the UI.
	- If you *can* tell when the component goes into 'sticky mode', you are still restricted from changing the height of the UI because that makes scrolling jarring.

	Terminology: 'sticky mode' = sticky render / content, 'non sticky mode' = relative render / content.

	This component tries to fix these problems with some optimizations and hacks:
	- We use IntersectionObserver to detect when to go into 'sticky mode', instead of using a scroll listener.
	- The sticky container is actually a div with no height, and the sticky content is shown by using overflow and Flex when we enter sticky render.
	- There is a fake div that stores and fixes the height of the relative content so that changes in sticky content height won't affect the scroll. 
		- This was previously achieved by just double-rendering the relative content, but doesn't seem like 'The React Way'.

	Drawbacks to this:
	- Since our sticky container has no height, the 'hiding' of the sticky content as the user scrolls past the container doesn't look like it should -
		it overhangs. That can be fixed with extra margin by the consuming application.


	There are 5 ways that I can think of that you'd want to handle the transition from relative to sticky:
	- instant: the default, most like if you hadn't used this component at all. This is smooth but doesn't work well if the sticky content is smaller.
	- disappear: the sticky content won't show until the relative content is completely off screen. I've seen quite a few like this online.
		It means there is no real need to use CSS transitions between the relative and sticky content, but you probably want to use react-spring to animate in the sticky content.
	- carry: A hybrid that I like, where the relative content is actually used as the sticky until its height is crossed, then it is substituted with sticky content.
		This seems smoothest to me.

	These last two are not possible without calculating the stick content's height, which wouldn't be known ahead of time:
	- disappear-short: Like the disappear transition, but don't wait until all the relative content's height is gone - just enough for the sticky content.
	- carry-short: Like the carry transition, but don't wait until all the relative content's height is crossed - just enough for the sticky content.
*/


export enum StickyTransition {
	/**
	 * Applies the sticky render as soon as possible. Uses the least code and is suitable when there are no changes in size during the transition.
	*/
	instant,
	/**
	 * Doesn't apply the sticky render until the relative render has completely disappeared.
	 */
	disappear,
	/**
	 * Uses the relative render as the sticky render until the original relative render box is disappeared, then triggers the sticky transition.
	*/
	carry,
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
	relativeContentHeight: number;
}

const threshold = createThreshold();

export function useSticky(input: StickyInput): StickyOutput {
	const { direction, transition } = input;
	const isTop = direction.toLowerCase() === 'top';

	const [isSticky, setIsSticky] = React.useState(false);

	// Track the height of our relative content to affect the intersection bounds.
	const [relativeContentSizeRef, relativeContentSize] = useControlledElementSize(0);
	const relativeContentHeight = relativeContentSize.height;

	// For non-instant transitions, change the margin at which the root will intersect with the target.
	// Make it equal to the target's height, so intersection only triggers after the element is gone.
	let rootMargin: string | undefined = undefined;
	if (relativeContentHeight > 0 && transition !== StickyTransition.instant) {
		if (isTop) {
			rootMargin = `${relativeContentHeight}px 0px 0px 0px`;
		}
		else {
			rootMargin = `0px 0px ${relativeContentHeight}px 0px`;
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
		let isSticky = false;
		if (intersect) {
			isSticky = isTop ? intersect.top.isBefore : intersect.bottom.isAfter;
		}
		setIsSticky(isSticky);
	});

	return {
		input: input,
		intersectTargetRef: intersectTargetRef,
		intersectRootRef: intersectRootRef,
		isSticky: isSticky,
		relativeContentSizeRef: relativeContentSizeRef,
		relativeContentHeight: relativeContentHeight,
	};
}

export interface StickyProps {
	output: StickyOutput;
	/**
	 * If provided, the children of this component will be used only for the sticky render.
	 * This relative content will always be used for the relative render.
	 */
	relativeContent: JSX.Element | null;
}

export const Sticky: React.FC<StickyProps> = (props) => {
	const { output, relativeContent, children } = props;
	const { input, isSticky, relativeContentSizeRef, relativeContentHeight } = output;
	const { direction, transition } = input;

	const isTop = direction === 'top';

	/*
		If we were supplied with a relative render, use it to calculate height (for disappear / carry logic).
		Otherwise, get the height from the sticky content - but know that it's dangerous to do so when you intend to change the sticky content height.
	*/
	let relativeRender: JSX.Element = null!;
	let stickyContent: JSX.Element = null!;
	if (relativeContent) {
		relativeRender = (
			<div ref={relativeContentSizeRef}>
				{relativeContent}
			</div>
		);
		stickyContent = <>{children}</>;
	}
	else {
		relativeRender = (
			<FakeHeight dataHeight={Math.max(0, relativeContentHeight)} />
		);
		stickyContent = (
			<div ref={relativeContentSizeRef}>
				{children}
			</div>
		);
	}

	const isVisible = transition === StickyTransition.carry || isSticky;

	const justifyContent = isTop ? 'flex-start' : 'flex-end';
	const stickyRender = (
		<StickyContainer isSticky={true} dataDirection={direction}>
			<OverflowContentContainer justifyContent={justifyContent} isVisible={isVisible}>
				{stickyContent}
			</OverflowContentContainer>
		</StickyContainer>
	);

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
}

const StickyContainer = styled.div.attrs<StickyContainerProps>((p) => {
	const { dataDirection, isSticky } = p;
	const style: Partial<CSSStyleDeclaration> = {
		[dataDirection]: '0px',
		position: isSticky ? 'sticky' : 'relative',
		height: '0px'
	};

	return {
		style: style
	};
})`` as StyledComponent<'div', any, StickyContainerProps, never>;

interface OverflowContentContainerProps {
	isVisible: boolean;
}

const OverflowContentContainer = styled(FlexColumn) <OverflowContentContainerProps>`
	height: 0;
	overflow: ${p => p.isVisible ? 'visible' : 'hidden'};
`;

interface FakeHeightProps {
	dataHeight: number;
}

const FakeHeight = styled.div<FakeHeightProps>`
	height: ${p => p.dataHeight}px;
`;
