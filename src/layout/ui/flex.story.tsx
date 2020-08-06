import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled } from '@/test/styled';
import { Flex, FlexRoot } from './flex';

export default { title: 'Layout/UI' };

const FlexBorder = styled(Flex)`
	border: 2px solid ${p => p.theme.color.text};
`;

// 'Root' components use 100% width/height with flex

export const TestFlexColumn = decorate('Flex Column', () => {
	return (
		<FlexRoot flexDirection='column'>
			<FlexBorder flex={2}>
				<p>Flex Column - 2</p>
			</FlexBorder>
			<FlexBorder>
				<p>Flex Column - 1</p>
			</FlexBorder>
			<FlexBorder flex={0}>
				<p>Flex Column - 0</p>
			</FlexBorder>
		</FlexRoot>
	);
});

export const TestFlexRow = decorate('Flex Row', () => {
	return (
		<FlexRoot flexDirection='row'>
			<FlexBorder flex={2}>
				<p>Flex Row - 2</p>
			</FlexBorder>
			<FlexBorder>
				<p>Flex Row - 1</p>
			</FlexBorder>
			<FlexBorder flex={0}>
				<p>Flex Row - 0</p>
			</FlexBorder>
		</FlexRoot>
	);
});

