import * as React from 'react';
import { createThreshold, useControlledElementIntersect } from '@/layout/services/element-intersect/element-intersect';
import styled, { StyledComponent } from 'styled-components';

export interface SimpleStickyInput {
	direction: 'top' | 'bottom';
}

export interface SimpleStickyOutput {
	intersectTargetRef: React.RefObject<any>;
	intersectRootRef: React.RefObject<any>;
	isSticky: boolean;
}

const threshold = createThreshold();

export function useSimpleSticky(props: SimpleStickyInput): SimpleStickyOutput {
	const { direction } = props;
	const isTop = direction.toLowerCase() === 'top';

	const [intersectTargetRef, intersect, intersectRootRef] = useControlledElementIntersect({
		useRoot: true,
		threshold: threshold
	});

	let isSticky = false;
	if (intersect) {
		isSticky = isTop ? intersect.top.isBefore : intersect.bottom.isAfter;
	}

	return {
		intersectTargetRef: intersectTargetRef,
		intersectRootRef: intersectRootRef,
		isSticky: isSticky,
	};
}

export interface SimpleStickyProps {
	input: SimpleStickyInput;
}

export const SimpleSticky: React.FC<SimpleStickyProps> = (props) => {
	const { input, children } = props;
	const { direction } = input;

	// Container is always sticky - the sticky variable is really more for the consuming component.
	return (
		<StickyContainer dataDirection={direction}>
			{children}
		</StickyContainer>
	);
};

interface StickyContainerProps {
	dataDirection: 'top' | 'bottom';
}

const StickyContainer = styled.div.attrs<StickyContainerProps>((p) => {
	const { dataDirection } = p;
	const style: Partial<CSSStyleDeclaration> = {
		[dataDirection]: '0px',
		position: 'sticky',
	};

	return {
		style: style
	};
})`` as StyledComponent<'div', any, StickyContainerProps, never>;