import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled, css } from '@/test/styled';
import { FlexRoot, Flex } from '../flex/flex';
import { SimpleStickyInput, useSimpleSticky, SimpleSticky } from './sticky-simple';
import { boolean, select } from '@storybook/addon-knobs';
import { StickyInput, useSticky, StickyTransition, Sticky } from './sticky';

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
	const { isSticky, intersectRootRef, intersectTargetRef } = useSimpleSticky(simpleStickyInput);

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
				<ScrollContainer ref={intersectRootRef}>
					<Scroller >
						<p>Test</p>
						<Filler />
						<Filler />
						<p>Test</p>
						<div ref={intersectTargetRef}>
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

const transitions = {
	instant: StickyTransition.instant,
	disappear: StickyTransition.disappear,
	carry: StickyTransition.carry,
};

export const TestStickyTransition = decorate('Transition', () => {

	const useRelativeHeightContent = boolean('Use Relative Height Content', false);
	const useChangingHeight = boolean('Use Changing Height With Relative Height Content', true);

	const direction = select('Direction', directions, directions.top) as keyof typeof directions;
	const isTop = direction === 'top';

	const transition = select('Transition', transitions, transitions.instant) as StickyTransition;
	const transitionName = StickyTransition[transition as unknown as keyof typeof StickyTransition];

	///////////

	const stickyInput: StickyInput = {
		direction: direction,
		transition: transition
	};
	const stickyOutput = useSticky(stickyInput);
	const { intersectRootRef, intersectTargetRef, isSticky } = stickyOutput;

	const relativeHeightContent = !useRelativeHeightContent ? null : (
		<TransitionStickyContent isSticky={false} isDifferentHeightWhenSticky={false}>
			<p>Here's the {isTop ? 'Header' : 'Footer'}.</p>
		</TransitionStickyContent>
	);

	const stickyRender = (
		<Sticky output={stickyOutput} relativeHeightContent={relativeHeightContent}>
			<TransitionStickyContent isSticky={isSticky} isDifferentHeightWhenSticky={useRelativeHeightContent && useChangingHeight}>
				<p>Here's the sticky render {isSticky ? ' STICKY' : ''} {isTop ? 'Header' : 'Footer'}.</p>
			</TransitionStickyContent>
		</Sticky>
	);

	///////////

	const upperStickyRender = isTop ? stickyRender : null;
	const lowerStickyRender = isTop ? null : stickyRender;

	return (
		<>
			<FlexRoot flexDirection='column'>
				<p>{transitionName} | {isSticky ? 'Sticky' : 'Regular'}</p>
				<ScrollContainer ref={intersectRootRef}>
					<Scroller >
						<p>Test</p>
						<Filler />
						<p>Test</p>
						<Filler />
						<p>Test</p>
						<div ref={intersectTargetRef}>
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
	isSticky: boolean;
	isDifferentHeightWhenSticky: boolean;
}

const TransitionStickyContent = styled.div<TransitionStickyContentProps>`
	padding: 1rem;
	transition: all .5s linear;
	transition-property: opacity, border-color, padding;
	background-color: ${p => p.theme.color.backgroundSecondary};

	border: 4px solid transparent;
	opacity: 1;

	${p => p.isSticky && p.isDifferentHeightWhenSticky && css`
		padding: .5rem 1rem;
	`};
	${p => p.isSticky && css`
		border: 4px solid green;
		opacity: .7;
	`};
`;