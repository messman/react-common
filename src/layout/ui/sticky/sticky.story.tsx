import * as React from 'react';
import { decorate } from '@/test/decorate';
import { styled, css } from '@/test/styled';
import { FlexRoot, Flex } from '../flex/flex';
import { createThreshold } from '@/layout/services/element-intersect/element-intersect';
import { useSticky, StickyTransition, StickyInput, Sticky } from './sticky';

export default { title: 'Layout/UI/Sticky' };

const ScrollContainer = styled(Flex)`
	overflow: auto;
`;

const Scroller = styled.div`
	width: 100%;
	background: rgb(6,169,203);
	background: linear-gradient(180deg, rgba(6,169,203,1) 0%, rgba(9,9,121,1) 100%);
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

const threshold = createThreshold();

export const TestStickyInstant = decorate('Instant', () => {

	const stickyHeaderInput: StickyInput = {
		direction: 'top',
		intersectOptions: {
			useRoot: false,
			rootMargin: '0%',
			threshold: threshold
		},
		transition: StickyTransition.instant,
	};
	const stickyHeaderOutput = useSticky(stickyHeaderInput);

	const stickyFooterInput: StickyInput = {
		direction: 'bottom',
		intersectOptions: {
			useRoot: false,
			rootMargin: '0%',
			threshold: threshold
		},
		transition: StickyTransition.instant,
	};
	const stickyFooterOutput = useSticky(stickyFooterInput);

	const HeaderStickyContent = stickyHeaderOutput.isSticky ? ActiveInstantSticky : RegularInstantSticky;
	const FooterStickyContent = stickyFooterOutput.isSticky ? ActiveInstantSticky : RegularInstantSticky;

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
						<div ref={stickyHeaderOutput.intersectTargetRef}>
							<div ref={stickyFooterOutput.intersectTargetRef}>
								<Sticky input={stickyHeaderInput} output={stickyHeaderOutput}>
									<HeaderStickyContent>
										<p>Here's the Header.</p>
									</HeaderStickyContent>
								</Sticky>
								<p>Test</p>
								<Filler />
								<p>Test</p>
								<Sticky input={stickyFooterInput} output={stickyFooterOutput}>
									<FooterStickyContent>
										<p>Here's the Footer.</p>
									</FooterStickyContent>
								</Sticky>
							</div>
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

const commonInstantSticky = css`
	padding: 1rem;
	transition: all .5s linear;
	transition-property: opacity border-color;
	background-color: ${p => p.theme.color.backgroundSecondary};
`;

const RegularInstantSticky = styled.div`
	${commonInstantSticky};
	border-bottom: 2px solid transparent;
	opacity: 1;
`;
const ActiveInstantSticky = styled.div`
	${commonInstantSticky};
	border-bottom: 2px solid red;
	opacity: .5;
`;



// const StickyHeader: React.FC = (props) => {

// 	const [intersectTargetRef, intersect] = useControlledElementIntersect(intersectOptions);

// 	const isInStickyMode = intersect && intersect.intersectionRatio < 1;

// 	const [headerHeight, setHeaderHeight] = React.useState(-1);
// 	const sizeRef = useElementSize(0, (_, height) => {
// 		if (!isInStickyMode || headerHeight === -1) {
// 			setHeaderHeight(height);
// 		}
// 	});

// 	let innerContent: JSX.Element = null!;
// 	if (isInStickyMode) {
// 		innerContent = (
// 			<ActiveStickyBackground>
// 				<p>Sticky!</p>
// 			</ActiveStickyBackground>
// 		);
// 	}
// 	else {
// 		innerContent = (
// 			<RegularStickyBackground>
// 				<p>Regular</p>
// 			</RegularStickyBackground>
// 		);
// 	}

// 	return (
// 		<div ref={intersectTargetRef}>
// 			<StickyContainer isSticky={true} ref={sizeRef}>
// 				{innerContent}
// 			</StickyContainer>
// 			{props.children}
// 		</div>
// 	);
// };