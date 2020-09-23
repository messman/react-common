import * as React from 'react';
import styled, { StyledComponent } from 'styled-components';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
	flex?: number | string;
	order?: number;
}

/*
	Note on flex value (flex={0} and flex='none') TL;DR: Try flex='none'
	Flex '0' means '0 1 0%'
		use the width/height of the inner content, but ignore width and height set on the element
	Flex 'none' means '0 0 auto'
		use the width and height set on the element or fall back to width/height of the inner content
*/
/*
	Note on performance: We use Flex *a lot* in this application. So styled-components gives this warning:
	"Over 200 classes were generated for component Flex with the id of [_______].
	Consider using the attrs method, together with a style object for frequently changed styles."

	More info: https://stackoverflow.com/q/57996925
	Solution: use the recommended approach, even if just to get the warning out of the way.	
*/
export const Flex = styled.div.attrs((p: FlexProps) => {
	const style: Partial<CSSStyleDeclaration> = {};

	if (p.flex) {
		style.flex = p.flex.toString();
	}
	if (p.order) {
		style.order = p.order.toString();
	}
	return {
		style: style
	};
})`
	position: relative;
` as StyledComponent<'div', any, FlexProps, never>;


Flex.defaultProps = {
	flex: 1
};

interface FlexParentProps extends FlexProps {
	/**
	 * Default: row
	 */
	flexDirection?: 'row' | 'column';
	/**
	 * Row: how items act vertically. Column: how items act horizontally.
	 * Default: stretch
	 */
	alignItems?: 'stretch' | 'center';
	/**
	 * How items work along the direction of row/column. Default: flex-start.
	 * Default: flex-start
	 * */
	justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
	/**
	 * If true, uses display: inline-flex.
	 * Default: false
	 */
	isInline?: boolean;
}

export const FlexParent = styled(Flex) <FlexParentProps>`
	display: ${p => p.isInline ? 'inline-flex' : 'flex'};
	flex-direction: ${p => p.flexDirection};
	align-items: ${p => p.alignItems};
	justify-content: ${p => p.justifyContent};
`;

FlexParent.defaultProps = {
	flexDirection: 'row',
	alignItems: 'stretch',
	justifyContent: 'flex-start'
};

export const FlexRoot = styled(FlexParent)`
	height: 100%;
	width: 100%;
`;

export const FlexColumn = styled(FlexParent)``;
FlexColumn.defaultProps = {
	flexDirection: 'column'
};

export const FlexRow = styled(FlexParent)``;
FlexRow.defaultProps = {
	flexDirection: 'row'
};