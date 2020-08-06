import * as React from 'react';
import { themes, LocalStorageThemeProvider, useLocalStorageThemeProvider } from './theme';
import { select, withKnobs, boolean } from '@storybook/addon-knobs';
import { DocumentVisibilityProvider } from '@/lifecycle/visibility/visibility';
import { WindowDimensionsProvider } from '@/layout/services/window-dimensions';
import { ResponsiveLayoutProvider, defaultLowerBreakpoints } from '@/layout/services/responsive-layout';

export interface StoryComponent {
	(): JSX.Element,
	story?: {
		name?: string;
		decorators?: any[];
	};
}

export function decorate(name: string, Component: React.FC) {

	/*
		Some funky stuff is required here.
		Never forget, you spent like 4 hours on this.
	
		See the issues below - it all comes down to how stories are exported with decorators.
		The first made me believe that I should use <Story /> in decorators. That would solve the issue where
		decorators (which supply the contexts) were not being applied.
		But that ends up causing the stories to unmount themselves every time a Knob is clicked, which broke the async promise story testing.
		Solution: wrap each story in another component to create that 'indirect' scenario. Move on with life.
	
		https://github.com/storybookjs/storybook/issues/10296
		https://github.com/storybookjs/storybook/issues/4059
	*/
	const story: React.FC = () => {
		return (
			<Component />
		);
	};

	const decorator = (story: () => JSX.Element) => {
		return (
			<Wrapper>
				{story()}
			</Wrapper>
		);
	};

	const storyComponent = story as StoryComponent;
	storyComponent.story = {
		name: name,
		decorators: [decorator, withKnobs]
	};
	return storyComponent;
};

const Wrapper: React.FC = (props) => {

	const themeOptions: { [key: string]: number; } = {};
	themes.forEach((theme, index) => {
		themeOptions[theme.name] = index;
	});
	const localStorageThemeProvider = useLocalStorageThemeProvider();
	const [themeIndex, setThemeIndex] = localStorageThemeProvider;
	const selectedThemeIndex = select('Theme', themeOptions, themeIndex, 'Global');

	React.useEffect(() => {
		if (themeIndex !== selectedThemeIndex) {
			setThemeIndex(selectedThemeIndex);
		}
	}, [selectedThemeIndex]);

	const forceHidden = boolean('Force Hidden', false, 'Global');

	return (
		<DocumentVisibilityProvider testForceHidden={forceHidden}>
			<LocalStorageThemeProvider value={localStorageThemeProvider}>
				<WindowDimensionsProvider>
					<ResponsiveLayoutProvider lowerBreakpoints={defaultLowerBreakpoints}>
						{props.children}
					</ResponsiveLayoutProvider>
				</WindowDimensionsProvider>
			</LocalStorageThemeProvider>
		</DocumentVisibilityProvider>
	);
};