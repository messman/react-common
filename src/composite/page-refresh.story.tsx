import * as React from 'react';
import { decorate } from '@/test/decorate';
import { number, select, boolean } from '@storybook/addon-knobs';
import { useSafeTimer, SafeTimerOutput, seconds } from '@/lifecycle/timer/timer';
import { createContextConsumer } from '@/utility/context/context';
import { FlexRoot, FlexRow, FlexColumn } from '@/layout/ui/flex';
import styled from 'styled-components';
import { getTimerStatus } from '@/test/shared';

/*
	Goal of this test:

	+ Two sections on screen, representing the 'Home' and 'Popular' screens on Reddit.
	+ At any time, only one of these two sections is active. There is a way to switch between them and make the other active.
	- Each section has two promises, like fake data calls. 'Home' has A and B; 'Popular' has A and C. So A is shared between them.
	- These promises are on timers. Promise A executes on test load, then starts its timer; the other promises start the first time their view is active.
	- These promises won't run again until their timers expire.
	- If a timer expires and the view is not active, nothing happens: it is only after the view becomes active that promise B or C will start.
	+ Promise A is like the 'new version available' toast message that can appear at the bottom, executing immediately after the timer expires.
	- Promise B and C can each be to trigger the 'UPDATE' button - meaning, they won't run their promise until the button is clicked. Then their promise runs, then the timer starts on success or failure.

*/

export default { title: 'Composite/Page Refresh' };

const [HomeTimerProvider, homeTimerConsumer] = createContextConsumer<SafeTimerOutput>();
const [PopularTimerProvider, popularTimerConsumer] = createContextConsumer<SafeTimerOutput>();

const pages = {
	home: 0,
	popular: 1
};

const defaultUpdateExpiration = seconds(30);
const defaultHomeExpiration = seconds(15);
const defaultPopularExpiration = seconds(15);

export const TestPageRefresh = decorate('Page Refresh', () => {

	const showPageManager = boolean('Show Pages', false);
	const activePageIndex = select('Active', pages, pages.home);
	const updateExpiration = number('Update Timer Expiration', defaultUpdateExpiration);
	const homeExpiration = number('Home Timer Expiration', defaultHomeExpiration);
	const popularExpiration = number('Popular Timer Expiration', defaultPopularExpiration);

	const updateTimer = useSafeTimer({
		expiration: updateExpiration,
		startImmediately: true
	});

	const homeTimer = useSafeTimer({
		expiration: homeExpiration,
		startImmediately: false
	});

	const popularTimer = useSafeTimer({
		expiration: popularExpiration,
		startImmediately: false
	});

	let content: JSX.Element = null!;
	if (showPageManager) {
		content = <PageManager activeIndex={activePageIndex} />;
	}
	else {
		content = <OtherView updateTimer={updateTimer} />;
	}

	let refreshButton: JSX.Element | null = null;
	if (updateTimer.expired) {
		refreshButton = <PageRefreshButton />;
	}

	return (
		<HomeTimerProvider value={homeTimer}>
			<PopularTimerProvider value={popularTimer}>
				<FlexRoot flexDirection='column'>
					{content}
					{refreshButton}
				</FlexRoot>
			</PopularTimerProvider>
		</HomeTimerProvider>
	);
});

interface OtherViewProps {
	updateTimer: SafeTimerOutput;
}

const OtherView: React.FC<OtherViewProps> = (props) => {

	const { updateTimer } = props;

	const timerStatus = getTimerStatus(updateTimer);

	return (
		<Background color='cornflowerblue'>
			<Margin>
				<p>
					This is a loading screen, settings, screen, etc.
				</p>
				<p>
					{timerStatus}
				</p>
			</Margin>
		</Background>
	);
};

const PageRefreshButton: React.FC = () => {

	function onClick() {
		window.location.reload();
	}

	return (
		<Margin onClick={onClick}>
			<p>An update is available! Click here to restart the application.</p>
		</Margin>
	);
};


interface PageManagerProps {
	activeIndex: number;
}

const PageManager: React.FC<PageManagerProps> = (props) => {

	const { activeIndex } = props;

	const isActiveHome = activeIndex === pages.home;

	return (
		<FlexRow>
			<Page
				name='Home'
				color='mediumturquoise'
				isActive={isActiveHome}
				consumer={homeTimerConsumer}
			/>
			<Page
				name='Popular'
				color='mediumseagreen'
				isActive={!isActiveHome}
				consumer={popularTimerConsumer}
			/>
		</FlexRow>
	);
};


interface PageProps {
	name: string;
	color: string;
	isActive: boolean;
	consumer: () => SafeTimerOutput;
}

const Page: React.FC<PageProps> = (props) => {

	const { name, color, isActive } = props;

	const flex = isActive ? 2 : 1;
	const isActiveText = isActive ? 'Active' : 'Not Active';

	return (
		<FlexColumn flex={flex}>
			<Background color={color}>
				<Margin>
					<Center>
						<h2>{name}</h2>
						<p>{isActiveText}</p>
					</Center>
				</Margin>
			</Background>
		</FlexColumn>
	);

};

const Center = styled.div`
	text-align: center;
`;

interface BackgroundProps {
	color: string;
}

const Background = styled(FlexColumn) <BackgroundProps>`
	background-color: ${p => p.color};
`;

const Margin = styled.div`
	margin: 1rem;
`;