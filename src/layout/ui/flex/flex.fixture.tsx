import * as React from 'react';
import { styled } from '@/test/styled';
import { Flex, FlexRoot } from './flex';
import { TestWrapper } from '@/test/decorate';

const FlexBorder = styled(Flex)`
	border: 2px solid ${p => p.theme.color.text};
`;

// 'Root' components use 100% width/height with flex

export default {
	'Flex Column': () => {
		return (
			<TestWrapper>
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
			</TestWrapper>
		);
	},
	'Flex Row': () => {
		return (
			<TestWrapper>
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
			</TestWrapper>
		);
	},
};