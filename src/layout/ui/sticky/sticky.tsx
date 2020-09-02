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
	stickyContentSizeRef: React.RefObject<any>;
}

const threshold = createThreshold();

export function useSticky(input: StickyInput): StickyOutput {
	const { direction, transition } = input;
	const isTop = direction.toLowerCase() === 'top';

	const [isSticky, setIsSticky] = React.useState(false);

	const [relativeContentSizeRef, relativeContentSize] = useControlledElementSize(0);
	const [stickyContentSizeRef] = useControlledElementSize(0);
	const stickyHeight = relativeContentSize.height;

	let rootMargin: string | undefined = undefined;
	if (stickyHeight > 0 && transition !== StickyTransition.instant) {
		let topMargin = 0;
		let bottomMargin = 0;

		if (transition === StickyTransition.disappear || transition === StickyTransition.carry) {
			if (isTop) {
				topMargin = stickyHeight;
			}
			else {
				bottomMargin = stickyHeight;
			}
		}

		rootMargin = `${topMargin}px 0px ${bottomMargin}px 0px`;
	}

	const [intersectTargetRef, intersectRootRef] = useElementIntersect({
		useRoot: true,
		rootMargin: rootMargin,
		threshold: threshold
	}, (intersect) => {
		if (!intersect) {
			return;
		}

		/*
			Stick is not just intersecting.
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
		stickyContentSizeRef: stickyContentSizeRef,
	};
}

export interface StickyProps {
	output: StickyOutput;
	relativeContent: JSX.Element | null;
	stickyContent: JSX.Element | null;
}

export const Sticky: React.FC<StickyProps> = (props) => {
	const { output, relativeContent, stickyContent } = props;
	const { input, isSticky, relativeContentSizeRef, stickyContentSizeRef } = output;
	const { direction, transition } = input;

	const isTop = direction === 'top';

	const relativeRender = (
		<div ref={relativeContentSizeRef}>
			{relativeContent}
		</div>
	);

	const isActuallySticky = transition === StickyTransition.carry || isSticky;

	const justifyContent = isTop ? 'flex-start' : 'flex-end';
	const stickyRender = (
		<StickyContainer isSticky={true} dataDirection={direction}>
			<OverflowContentContainer justifyContent={justifyContent} isSticky={isActuallySticky}>
				<div ref={stickyContentSizeRef}>

					{stickyContent}
				</div>
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
	isSticky: boolean;
}

const OverflowContentContainer = styled(FlexColumn) <OverflowContentContainerProps>`
	height: 0;
	overflow: ${p => p.isSticky ? 'visible' : 'hidden'};
`;
