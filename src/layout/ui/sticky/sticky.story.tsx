import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled, css } from '@/test/styled';
import { FlexRoot, Flex } from '../flex/flex';
import { SimpleStickyInput, useSimpleSticky, SimpleSticky } from './sticky-simple';
import { boolean, select } from '@storybook/addon-knobs';
import { StickyInput, useSticky, Sticky } from './sticky';
import { useRenderCount } from '@/debug/render';

export default { title: 'Layout/UI/Sticky' };

const directions = {
	top: 'top',
	bottom: 'bottom'
};

const ScrollContainer = styled(Flex)`
	overflow: auto;
`;

const Scroller = styled.div`
	width: 100%;
	background: darkblue;
`;

const Filler = styled.div`
	height: 600px;
	background-color: deepskyblue;
	opacity: .5;
`;

const SimpleStickyHeader = styled.div`
	position: sticky;
	top: 0;
	background-color: ${p => p.theme.color.backgroundSecondary};
	padding: 1rem;
	z-index: 2;
`;

const SimpleStickyFooter = styled.div`
	position: sticky;
	bottom: 0;
	background-color: ${p => p.theme.color.backgroundSecondary};
	padding: 1rem;
`;

export const TestStickyWithoutLibrary = decorate('Without Library', () => {
	return (
		<>
			<FlexRoot flexDirection='column'>
				<p>Some other content</p>
				<ScrollContainer>
					<Scroller>
						<p>Test</p>
						<Filler />
						<Filler />
						<p>Test</p>
						<div>
							<SimpleStickyHeader>
								<p>Here's the Header.</p>
							</SimpleStickyHeader>
							<p>Test</p>
							<Filler />
							<p>Test</p>
							<SimpleStickyFooter>
								<p>Here's the Footer.</p>
							</SimpleStickyFooter>
						</div>
						<p>Test</p>
						<Filler />
						<Filler />
						<p>Test</p>
					</Scroller>
				</ScrollContainer>
			</FlexRoot>
		</>
	);
});

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export const TestSimpleSticky = decorate('Simple', () => {

	const useTop = boolean('Use Top Sticky', true);

	const simpleStickyInput: SimpleStickyInput = {
		direction: useTop ? 'top' : 'bottom'
	};
	const { isSticky, rootRef, containerTargetRef } = useSimpleSticky(simpleStickyInput);

	const stickyRender = (
		<SimpleSticky input={simpleStickyInput}>
			<SimpleStickyExample isSticky={isSticky}>
				<p>Here's the {useTop ? 'Header' : 'Footer'}.</p>
			</SimpleStickyExample>
		</SimpleSticky>
	);

	const upperStickyRender = useTop ? stickyRender : null;
	const lowerStickyRender = useTop ? null : stickyRender;

	return (
		<>
			<FlexRoot flexDirection='column'>
				<p>Status: {isSticky ? 'Sticky' : 'Regular'}</p>
				<ScrollContainer ref={rootRef}>
					<Scroller >
						<p>Test</p>
						<Filler />
						<Filler />
						<p>Test</p>
						<div ref={containerTargetRef}>
							{upperStickyRender}
							<p>Test</p>
							<Filler />
							<p>Test</p>
							{lowerStickyRender}
						</div>
						<p>Test</p>
						<Filler />
						<Filler />
						<p>Test</p>
					</Scroller>
				</ScrollContainer>
			</FlexRoot>
		</>
	);
});

interface SimpleStickyExampleProps {
	isSticky: boolean;
}

const SimpleStickyExample = styled.div<SimpleStickyExampleProps>`
	padding: 1rem;
	transition: all .2s linear;
	transition-property: opacity, border-color;
	background-color: ${p => p.theme.color.backgroundSecondary};

	border: 2px solid transparent;
	opacity: 1;

	${p => p.isSticky && css`
		border: 2px solid green;
		opacity: .7;
	`};
`;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const transitionNames = ['instant', 'half', 'almost', 'full', 'double'];

const transitions = {
	instant: [0, undefined],
	half: [.5, undefined],
	almost: [1, -10],
	full: [1, undefined],
	double: [2, undefined]
} as unknown as any;

export const TestStickyTransition = decorate('Transition', () => {

	const renderCount = useRenderCount('Test Sticky Transition');

	const useChangingHeight = boolean('Use Changing Height', false);
	const useEarlySticky = boolean('Use Early Sticky', false);

	const direction = select('Direction', directions, directions.top) as keyof typeof directions;
	const isTop = direction === 'top';

	const transitionName = select('Transition', transitionNames, transitionNames[0]);
	const [percent, pixels] = transitions[transitionName];

	///////////

	const stickyInput: StickyInput = {
		direction: direction,
		useEarlySticky: useEarlySticky,
		thresholdPercent: percent,
		thresholdPixels: pixels
	};
	const stickyOutput = useSticky(stickyInput);
	const { rootRef, containerTargetRef, isSticky, isEarlySticky } = stickyOutput;

	const variableHeightStickyContent = !useChangingHeight ? null : (
		<TransitionStickyContent isChanged={isEarlySticky || isSticky} isDifferentHeight={isSticky}>
			<p>Here's the variable-height sticky {isTop ? 'Header' : 'Footer'}.</p>
		</TransitionStickyContent>
	);

	const render = (
		<Sticky output={stickyOutput} variableHeightStickyContent={variableHeightStickyContent}>
			<TransitionStickyContent isChanged={isEarlySticky || isSticky} isDifferentHeight={false}>
				<p>Here's the child {isTop ? 'Header' : 'Footer'}.</p>
			</TransitionStickyContent>
		</Sticky>
	);

	///////////

	const upperStickyRender = isTop ? render : null;
	const lowerStickyRender = isTop ? null : render;

	return (
		<>
			<FlexRoot flexDirection='column'>
				<p>{transitionName} | {isEarlySticky ? 'Early Sticky' : 'Not Early Sticky'} | {isSticky ? 'Sticky' : 'Regular'} | {renderCount}</p>
				<ScrollContainer ref={rootRef}>
					<Scroller >
						<p>Test</p>
						<Filler />
						<p>Test</p>
						<Filler />
						<p>Test</p>
						<div ref={containerTargetRef}>
							{upperStickyRender}
							<p>Test</p>
							<Filler />
							<p>Test</p>
							{lowerStickyRender}
						</div>
						<p>Test</p>
						<Filler />
						<p>Test</p>
						<Filler />
						<p>Test</p>
					</Scroller>
				</ScrollContainer>
			</FlexRoot>
		</>
	);
});

interface TransitionStickyContentProps {
	isChanged: boolean;
	isDifferentHeight: boolean;
}

const TransitionStickyContent = styled.div<TransitionStickyContentProps>`
	padding: 1rem;
	transition: all .5s linear;
	transition-property: opacity, border-color, padding;
	background-color: ${p => p.theme.color.backgroundSecondary};

	border: 4px solid transparent;
	opacity: 1;

	${p => p.isDifferentHeight && css`
		padding: .2rem 1rem;
	`};
	${p => p.isChanged && css`
		border: 4px solid green;
		opacity: .7;
	`};
`;