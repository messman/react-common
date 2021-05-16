import * as React from 'react';
import { createGlobalStyle, ThemeProps, ThemeProvider } from 'styled-components';
import { UseLocalStorageReturn } from '@/storage/local-storage';
import { localStorage } from './storage';

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
// Note: '#root' is for testing
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
	}
`;

const LocalStorageThemeContext = React.createContext<UseLocalStorageReturn<number>>(null!);

export const useLocalStorageThemeProvider = () => {
	return localStorage.useLocalStorage<number>('themeIndex', (value) => {
		return value || 0;
	});
};

export interface LocalStorageThemeProviderProps {
	value: UseLocalStorageReturn<number>;
}

export const LocalStorageThemeProvider: React.FC<LocalStorageThemeProviderProps> = (props) => {

	const [themeIndex] = props.value;
	const theme = themes[themeIndex!];

	return (
		<LocalStorageThemeContext.Provider value={props.value}>
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
	return themes[themeIndex!];
};