import * as React from 'react';
import { useControlledElementIntersect, ElementIntersectOptions, ElementIntersect } from '@/layout/services/element-intersect/element-intersect';
import styled, { StyledComponent } from 'styled-components';
//import { useElementSize } from '@/layout/services/element-size/element-size';

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
	replaceTransition?: JSX.Element | null;
	intersectOptions: ElementIntersectOptions;
}

export interface StickyOutput {
	intersectTargetRef: React.RefObject<any>;
	intersect: ElementIntersect | null;
	isSticky: boolean;
}

export function useSticky(props: StickyInput): StickyOutput {
	const { direction } = props;
	const { intersectOptions } = props;

	const [intersectTargetRef, intersect] = useControlledElementIntersect(intersectOptions);

	let isSticky = false;
	if (intersect && intersect.rootBounds) {
		isSticky = intersect.intersectionRatio < 1;
		if (isSticky) {
			switch (direction) {
				case 'top':
					isSticky = !intersect.isTopVisible;
					break;
				case 'bottom':
					isSticky = !intersect.isBottomVisible;
					break;
			}
		}
	}


	return {
		intersectTargetRef: intersectTargetRef,
		intersect: intersect,
		isSticky: isSticky
	};
}

export interface StickyProps {
	input: StickyInput;
	output: StickyOutput;
}

export const Sticky: React.FC<StickyProps> = (props) => {
	const { input, children } = props;

	const { transition, direction } = input;
	if (transition === StickyTransition.instant) {
		return (
			<StickyContainer direction={direction}>
				{children}
			</StickyContainer>
		);
	}
	return <>{children}</>;

	// const { direction, children, transition } = props;
	// const isTop = direction === 'top';



	// let isInStickyMode = false;
	// if (intersect && intersect.rootBounds) {
	// 	isInStickyMode = intersect.intersectionRatio < 1 && intersect.boundingClientRect.top < intersect.rootBounds.top;
	// }

	// const [headerHeight, setHeaderHeight] = React.useState(-1);
	// const sizeRef = useElementSize(0, (_, height) => {
	// 	if (!isInStickyMode || headerHeight === -1) {
	// 		setHeaderHeight(height);
	// 	}
	// });

	// let innerContent: JSX.Element = null!;
	// if (isInStickyMode) {
	// 	innerContent = (
	// 		<ActiveStickyBackground>
	// 			<p>Sticky!</p>
	// 		</ActiveStickyBackground>
	// 	);
	// }
	// else {
	// 	innerContent = (
	// 		<RegularStickyBackground>
	// 			<p>Regular</p>
	// 		</RegularStickyBackground>
	// 	);
	// }

	// return (
	// 	<div ref={intersectTargetRef}>
	// 		<StickyContainer isSticky={true} ref={sizeRef}>
	// 			{innerContent}
	// 		</StickyContainer>
	// 		{children}
	// 	</div>
	// );
};

// const threshold = createThreshold();
// const intersectOptions: ElementIntersectOptions = {
// 	useRoot: false,
// 	rootMargin: '0px',
// 	threshold: threshold
// };

interface StickyContainerProps {
	direction: 'top' | 'bottom';
}


const StickyContainer = styled.div.attrs<StickyContainerProps>((p) => {
	const { direction } = p;
	return {
		style: {
			[direction]: -1 + 'px',
			paddingTop: '1px',
			position: 'sticky'
		}
	};
})`` as StyledComponent<'div', any, StickyContainerProps, never>;
