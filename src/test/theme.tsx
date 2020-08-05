import * as React from 'react';
import { createGlobalStyle, ThemeProps, ThemeProvider } from 'styled-components';
import { keyFactory, useLocalStorage, UseLocalStorageReturn } from '@/storage/local-storage';

/** Custom application theme type. */
export interface Theme {
	name: string,
	color: {
		background: string,
		backgroundSecondary: string,
		backgroundTertiary: string,
		text: string,
	};
	fontFamily: string;
}

/** The dark theme */
const darkTheme: Theme = {
	name: 'dark',
	color: {
		background: '#0A0A0A',
		backgroundSecondary: '#1B1B1B',
		backgroundTertiary: '#2B2B2B',
		text: '#C7C7C7',
	},
	fontFamily: `'Work Sans', sans-serif;`
};

/** The light theme */
const lightTheme: Theme = {
	...darkTheme,
	name: 'light',
	color: {
		// Overrides
		background: '#FEFCFB',
		backgroundSecondary: '#F0F0F0',
		backgroundTertiary: '#DDDDDD',
		text: '#1B1B1B',
	}
};

// Index is stored in LocalStorage
export const themes: Theme[] = [darkTheme, lightTheme];

// For some reason, VS Code is not happy to colorize the CSS in this block when `createGlobalStyle` is used with a type.
// Note: '#root' is for storybook
// Note: overscroll-behavior comes from https://stackoverflow.com/a/50846937 to prevent macs going back (since we have horizontal scroll)
export const GlobalStyles = createGlobalStyle<ThemeProps<Theme>>`
	html {
		font-family: ${p => p.theme.fontFamily};
		font-weight: 400;
	}
	
	body {
		background-color: ${p => p.theme.color.background};
		color: ${p => p.theme.color.text};
	}

	html, body, #react-root, #root {
		margin: 0;
		padding: 0;
		height: 100%;

		overscroll-behavior: none;
	}

	* {
		font-weight: 400;
		vertical-align: top;
		-webkit-text-size-adjust: 100%;
		box-sizing: border-box;
		z-index: 1;
	}
`;

const LocalStorageThemeContext = React.createContext<UseLocalStorageReturn<number>>(null!);

const getKey = keyFactory('react-common');
const themeIndexKey = getKey('themeIndex');

export const LocalStorageThemeProvider: React.FC = (props) => {
	const localStorageReturn = useLocalStorage(themeIndexKey, 0, (value) => {
		return !!themes[value];
	}, null, '');
	const [themeIndex] = localStorageReturn;
	const theme = themes[themeIndex];

	return (
		<LocalStorageThemeContext.Provider value={localStorageReturn}>
			<ThemeProvider theme={theme}>
				<>
					<GlobalStyles />
					{props.children}
				</>
			</ThemeProvider>
		</LocalStorageThemeContext.Provider>
	);
};

export const useLocalStorageTheme = () => React.useContext(LocalStorageThemeContext);
export const useCurrentTheme = () => {
	const [themeIndex] = React.useContext(LocalStorageThemeContext);
	return themes[themeIndex];
};