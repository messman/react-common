import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled, css } from '@/test/styled';
import { FlexRoot, Flex } from '../flex/flex';
import { boolean, select } from '@storybook/addon-knobs';
import { useSticky, Sticky } from './sticky';
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
						<Text />
						<Filler />
						<Filler />
						<Text />
						<div>
							<SimpleStickyHeader>
								<p>Here's the Header.</p>
							</SimpleStickyHeader>
							<Text />
							<Filler />
							<Text />
							<SimpleStickyFooter>
								<p>Here's the Footer.</p>
							</SimpleStickyFooter>
						</div>
						<Text />
						<Filler />
						<Filler />
						<Text />
					</Scroller>
				</ScrollContainer>
			</FlexRoot>
		</>
	);
});

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const transitionNames = ['instant', 'half', 'full', 'double'];

const transitions = {
	instant: [0, undefined],
	half: [.5, undefined],
	full: [1, undefined],
	double: [2, undefined]
} as unknown as any;

const offset = 50;

export const TestStickyTransition = decorate('Transition', () => {

	const renderCount = useRenderCount('Test Sticky Transition');

	const useVariableContent = boolean('Use Variable Content', false);
	const allowDisappear = boolean('Allow Disappear', false);
	const useZIndex = boolean('Use Z-Index', true);
	const useOffset = boolean(`Use ${offset}px Offset`, false);

	const direction = select('Direction', directions, directions.top) as keyof typeof directions;
	const isTop = direction === 'top';

	const firstTransitionName = select('First', transitionNames, transitionNames[0]);
	const [firstFactor, firstPixels] = transitions[firstTransitionName];

	const secondTransitionName = select('Second', transitionNames, transitionNames[0]);
	const [secondFactor, secondPixels] = transitions[secondTransitionName];

	///////////
	//const isSticky = !isAtBoundary || isAtThreshold


	const stickyOutput = useSticky({
		direction: direction,
		offsetPixels: useOffset ? offset : 0,
		firstFactor: firstFactor,
		firstPixels: firstPixels,
		secondFactor: secondFactor,
		secondPixels: secondPixels,
		throttle: 0
	});
	const { rootRef, isAtFirst, isAtSecond } = stickyOutput;

	const zIndex = useZIndex ? 5 : undefined;

	let render: JSX.Element = null!;
	if (useVariableContent) {

		const isSticky = allowDisappear ? (false) : (!isAtFirst);
		const showVariableContent = allowDisappear ? (isAtFirst) : (isAtFirst);
		const isChanged = allowDisappear ? (isAtSecond) : (isAtSecond);
		const isDifferentHeight = allowDisappear ? (isAtSecond) : (isAtSecond);

		let variableContent: JSX.Element | null = <div />;
		if (showVariableContent) {
			variableContent = (
				<TransitionStickyContent isChanged={isChanged} isDifferentHeight={isDifferentHeight}>
					<p>Here's the variable {isTop ? 'Header' : 'Footer'}.</p>
				</TransitionStickyContent>
			);
		}

		render = (
			<Sticky output={stickyOutput} variableContent={variableContent} isSticky={isSticky} zIndex={zIndex}>
				<TransitionStickyContent isChanged={false} isDifferentHeight={false}>
					<p>Here's the regular {isTop ? 'Header' : 'Footer'}.</p>
				</TransitionStickyContent>
			</Sticky>
		);
	}
	else {
		const isSticky = allowDisappear ? (isAtFirst) : (true);
		const isChanged = allowDisappear ? (isAtSecond) : (isAtFirst);

		render = (
			<Sticky output={stickyOutput} isSticky={isSticky} zIndex={zIndex}>
				<TransitionStickyContent isChanged={isChanged} isDifferentHeight={false}>
					<p>Here's the ONLY {isTop ? 'Header' : 'Footer'}.</p>
				</TransitionStickyContent>
			</Sticky>
		);
	}

	///////////

	const upperStickyRender = isTop ? render : null;
	const lowerStickyRender = isTop ? null : render;

	return (
		<>
			<FlexRoot flexDirection='column'>
				<p>{firstTransitionName} / {secondTransitionName} | {isAtFirst ? 'At First' : 'Before First'} | {isAtSecond ? 'At Second' : 'Before Second'} | {renderCount}</p>
				<ScrollContainer ref={rootRef}>
					<Scroller >
						<Text />
						<Filler />
						<Text />
						<Filler />
						<Text />
						<div>
							{upperStickyRender}
							<Text />
							<Filler />
							<Text />
							{lowerStickyRender}
						</div>
						<Text />
						<Filler />
						<Text />
						<Filler />
						<Text />
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
	padding: 2rem 1rem;
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

const Text: React.FC = () => {
	return (
		<div>
			<Para>Here is some regular text.</Para>
		</div>
	);
};

const Para = styled.p`
	margin: 1rem;
	z-index: 1;
`;