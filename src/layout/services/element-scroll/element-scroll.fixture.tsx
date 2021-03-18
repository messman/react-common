import * as React from 'react';
import { styled } from '@/test/styled';
import { Flex, FlexRoot } from '@/layout/ui/flex/flex';
import { useElementScroll, ElementScroll } from './element-scroll';
import { usePrevious } from '@/utility/previous/previous';
import { useValue } from 'react-cosmos/fixture';
import { TestWrapper } from '@/test/decorate';

export default () => {

	const [throttle] = useValue('Throttle', { defaultValue: 0 });
	const [heightFactor] = useValue('Height Factor', { defaultValue: 3 });

	const [ref, elementScroll] = useElementScroll(throttle);
	const previousElementScroll = usePrevious(elementScroll);

	return (
		<TestWrapper>
			<FlexRoot flexDirection='column'>
				<p><strong>{getElementScrollStatus(elementScroll)}</strong></p>
				<p><em>Previous: {getElementScrollStatus(previousElementScroll || null)}</em></p>
				<FlexContainer ref={ref}>

					<Scroller heightFactor={heightFactor}>
						<p>Top!</p>
						<Flex />
						<p>Bottom!</p>
					</Scroller>
				</FlexContainer>
			</FlexRoot>
		</TestWrapper>
	);
};

function getElementScrollStatus(elementScroll: ElementScroll | null): string {
	if (!elementScroll) {
		return '';
	}
	const { scrollLeft, scrollTop, width, height, scrollLeftMax, scrollTopMax } = elementScroll;

	const percentLeft = 100 * (scrollLeft / scrollLeftMax) || 0;
	const percentTop = 100 * (scrollTop / scrollTopMax) || 0;

	const sides = [percentLeft === 0 ? 'left' : '', percentTop === 0 ? 'top' : '', percentLeft === 100 ? 'right' : '', percentTop === 100 ? 'bottom' : ''];
	let sidesText = sides.filter((s) => !!s).join(', ');
	if (sidesText) {
		sidesText = ` (${sidesText})`;
	}

	return `(${width} x ${height}) Left: ${scrollLeft} (${percentLeft.toFixed(1)}%) Top: ${scrollTop} (${percentTop.toFixed(1)}%)${sidesText}`;
}

const FlexContainer = styled(Flex)`
	overflow: auto;
`;

interface ScrollerProps {
	heightFactor: number;
}

const Scroller = styled.div<ScrollerProps>`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: ${p => p.heightFactor * 100}%;
	background: rgb(6,169,203);
	background: linear-gradient(180deg, rgba(6,169,203,1) 0%, rgba(9,9,121,1) 100%);
`;