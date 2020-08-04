import * as React from 'react';
import { FlexRoot } from '@/layout/ui/flex';
import { LocalStorageThemeProvider } from './theme';
import { defaultLowerBreakpoints, ResponsiveLayoutProvider } from '@/layout/services/responsive-layout';
import { WindowDimensionsProvider } from '@/layout/services/window-dimensions';

export const Wrapper: React.FC = (props) => {
	return (
		<Providers>
			<UI>
				{props.children}
			</UI>
		</Providers>
	);
};

const Providers: React.FC = (props) => {
	return (
		<LocalStorageThemeProvider>
			<WindowDimensionsProvider>
				<ResponsiveLayoutProvider lowerBreakpoints={defaultLowerBreakpoints}>
					{props.children}
				</ResponsiveLayoutProvider>
			</WindowDimensionsProvider>
		</LocalStorageThemeProvider>
	);
};

const UI: React.FC = (props) => {
	return (
		<FlexRoot flexDirection='column'>
			{props.children}
		</FlexRoot>
	);
};