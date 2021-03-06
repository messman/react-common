import * as React from 'react';
import { useTruthyTimer, getDebugTruthyTimerStatus } from '@/lifecycle/timer/timer';
import { createContextConsumer } from '@/utility/context/context';
import { FlexRoot, FlexRow, FlexColumn } from '@/layout/ui/flex/flex';
import styled from 'styled-components';
import { clampPromise, getDebugPromiseStatus } from '@/data/promise/promise';
import { useDocumentVisibility } from '@/lifecycle/visibility/visibility';
import { seconds } from '@/utility/time/time';
import { StalePromiseTimerOutput, useStalePromiseTimer, StalePromiseTimerComponent } from './stale-promise-timer';
import { useValue, useSelect } from 'react-cosmos/fixture';
import { wrap } from '@/test/decorate';

/*
	Goal of this test:

	+ Two sections on screen, representing the 'Home' and 'Popular' screens on Reddit.
	+ At any time, only one of these two sections is active. There is a way to switch between them and make the other active.
	+ Each section has two promises, like fake data calls. 'Home' has A and B; 'Popular' has A and C. So A is shared between them.
	+ These promises are on timers. Promise A executes on test load, then starts its timer; the other promises start the first time their view is active.
	+ These promises won't run again until their timers expire.
	+ If a timer expires and the view is not active, nothing happens: it is only after the view becomes active that promise B or C will start.
	+ Promise A is like the 'new version available' toast message that can appear at the bottom, executing immediately after the timer expires.
	+ Promise B and C can each be to trigger the 'UPDATE' button - meaning, they won't run their promise until the button is clicked. Then their promise runs, then the timer starts on success or failure.
*/

const [HomePromiseTimerProvider, homePromiseTimerConsumer] = createContextConsumer<StalePromiseTimerOutput<string[]>>();
const [PopularPromiseTimerProvider, popularPromiseTimerConsumer] = createContextConsumer<StalePromiseTimerOutput<string[]>>();
const [UseRefreshButtonOnTimerExpirationProvider, useRefreshButtonOnTimerExpirationConsumer] = createContextConsumer<boolean>();

const pages = {
	home: 0,
	popular: 1
};

const postData = [`Here's the top new thing!`, `Wow, look at this!`, `Check it out!`, `Sensational!`, `This is a post.`, `This is a developing breaking news story.`];

function shuffleArray<T>(array: T[]): void {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

const requestMin = seconds(5);

function getPosts(): string[] {
	shuffleArray(postData);
	const numberToGrab = 1 + Math.floor(Math.random() * postData.length);
	return postData.slice(0, numberToGrab);
}

const promiseFunc = () => {
	return clampPromise(new Promise<string[]>((resolve) => {
		resolve(getPosts());
	}), requestMin, null);
};

export default wrap(() => {

	const [showPageManager] = useValue('Show Pages', { defaultValue: false });
	const [useRefreshButtonOnPages] = useValue('Pages Show A Refresh Button', { defaultValue: false });
	const [activePageName] = useSelect('Active', { options: Object.keys(pages) });
	const [updateTimeout] = useValue('Update Timer Expiration', { defaultValue: 14 });
	const [homeTimeout] = useValue('Home Timer Expiration', { defaultValue: 8 });
	const [popularTimeout] = useValue('Popular Timer Expiration', { defaultValue: 8 });

	const [updateTimerIsCompleted, setUpdateTimerIsCompleted] = React.useState(false);

	const documentVisibility = useDocumentVisibility();

	const updateTimer = useTruthyTimer({
		isStarted: true,
		timeout: seconds(updateTimeout)
	}, documentVisibility, () => {
		console.log('update timer completed');
		setUpdateTimerIsCompleted(true);
	});

	const homePromiseTimer = useStalePromiseTimer({
		initialAction: StalePromiseTimerComponent.none,
		timerTimeout: seconds(homeTimeout),
		isTimerTruthy: documentVisibility,
		timerCallback: () => {
			console.log('home timer completed');
		},
		promiseFunc: promiseFunc,
		promiseCallback: (data, error) => {
			console.log('home promise completed', data, error);
		}
	});

	const popularPromiseTimer = useStalePromiseTimer({
		initialAction: StalePromiseTimerComponent.none,
		timerTimeout: seconds(popularTimeout),
		isTimerTruthy: documentVisibility,
		timerCallback: () => {
			console.log('popular timer completed');
		},
		promiseFunc: promiseFunc,
		promiseCallback: (data, error) => {
			console.log('popular promise completed', data, error);
		}
	});

	let content: JSX.Element = null!;
	if (showPageManager) {
		content = <PageManager activeIndex={pages[activePageName as keyof typeof pages]} />;
	}
	else {
		content = <OtherView timerStatus={getDebugTruthyTimerStatus(updateTimer)} />;
	}

	let windowReloadNotice: JSX.Element | null = null;
	if (updateTimerIsCompleted) {
		windowReloadNotice = <WindowReloadNotice />;
	}

	return (
		<UseRefreshButtonOnTimerExpirationProvider value={useRefreshButtonOnPages}>
			<HomePromiseTimerProvider value={homePromiseTimer}>
				<PopularPromiseTimerProvider value={popularPromiseTimer}>
					<FlexRoot flexDirection='column'>
						{content}
						{windowReloadNotice}
					</FlexRoot>
				</PopularPromiseTimerProvider>
			</HomePromiseTimerProvider>
		</UseRefreshButtonOnTimerExpirationProvider>
	);
});

interface OtherViewProps {
	timerStatus: string;
}

const OtherView: React.FC<OtherViewProps> = (props) => {
	const { timerStatus } = props;
	return (
		<Background color='dodgerblue'>
			<Margin>
				<p>
					This is a loading screen, settings, screen, etc.
				</p>
				<p>
					Refresh timer status: {timerStatus}
				</p>
			</Margin>
		</Background>
	);
};

const WindowReloadNotice: React.FC = () => {
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
				color='deepskyblue'
				isActive={isActiveHome}
				consumer={homePromiseTimerConsumer}
			/>
			<Page
				name='Popular'
				color='darkturquoise'
				isActive={!isActiveHome}
				consumer={popularPromiseTimerConsumer}
			/>
		</FlexRow>
	);
};

interface PageProps<T> {
	name: string;
	color: string;
	isActive: boolean;
	consumer: () => StalePromiseTimerOutput<T>;
}

const Page: React.FC<PageProps<string[]>> = (props) => {

	const { name, color, isActive, consumer } = props;

	// In a real-world example, you likely don't have this - we have it here for testing. So disregard the logic around this.
	const useRefreshButtonOnTimerExpiration = useRefreshButtonOnTimerExpirationConsumer();

	const promiseTimer = consumer();
	const { timer, promise, lastCompleted } = promiseTimer;

	React.useEffect(() => {
		if (!timer.isStarted && !promise.isStarted) {
			if (lastCompleted === StalePromiseTimerComponent.none) {
				if (isActive) {
					// Startup, choose the promise first.
					promise.reset({
						isStarted: true
					});
				}
			}
			else if (lastCompleted === StalePromiseTimerComponent.timer) {
				if (isActive) {
					if (!useRefreshButtonOnTimerExpiration) {
						promise.reset({
							isStarted: true
						});
					}
				}
			}
			else if (lastCompleted === StalePromiseTimerComponent.promise) {
				// NO check for active here, in case user switched off before ever seeing the old data.
				timer.reset({
					isStarted: true
				});
			}
		}

	}, [timer, promise, lastCompleted, isActive, useRefreshButtonOnTimerExpiration]);

	// Render posts
	let postsRender: JSX.Element = null!;
	if (promise.data) {
		const posts = promise.data.map((post, i) => {
			return (
				<p key={i}>{name} Post {i + 1}: {post}</p>
			);
		});
		postsRender = <>{posts}</>;
	}
	else {
		postsRender = <p>No posts to display.</p>;
	}

	// Show reload button
	let reloadButton: JSX.Element | null = null;
	if (useRefreshButtonOnTimerExpiration && isActive && !timer.isStarted && !promise.isStarted && lastCompleted === StalePromiseTimerComponent.timer) {
		function onReloadClick() {
			promise.reset({
				isStarted: true
			});
		}

		reloadButton = (
			<button onClick={onReloadClick}>Refresh Data</button>
		);
	}

	return (
		<FlexColumn flex={isActive ? 2 : 1}>
			<Background color={color}>
				<Margin>
					<Center>
						<h2>{name}</h2>
						<p>{isActive ? 'Active' : 'Inactive'}</p>
						<p>{useRefreshButtonOnTimerExpiration ? 'Using Refresh Button' : 'Using Instant Reload'}</p>
					</Center>
					<hr />
					<p>Timer: {getDebugTruthyTimerStatus(timer)}</p>
					<p>Promise: {getDebugPromiseStatus(promise)}</p>
					{reloadButton}
					{postsRender}
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