import * as React from 'react';
import { useElementIntersect, createThreshold } from '@/layout/services/element-intersect/element-intersect';
import styled, { StyledComponent } from 'styled-components';
import { useControlledElementSize } from '@/layout/services/element-size/element-size';
import { FlexColumn } from '../flex/flex';

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
	 * Allows the relative render to begin disappearing.
	 * Calculates the difference in heights between the relative and sticky renders and replaces when those heights match. If the sticky render height is less than
	 * that of the relative render, this operates like the instant transition.
	*/
	replaceDisappear,
	/**
	 * Allows the relative render to begin sticking. 
	 * Calculates the difference in heights between the relative and sticky renders and replaces when those heights match. If the sticky render height is less than
	 * that of the relative render, this operates like the instant transition.
	*/
	replaceCarry,
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
