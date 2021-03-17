import * as React from 'react';
import { LayoutOrientation, WindowLayout } from './window-layout';

const WindowMediaLayoutContext = React.createContext<WindowLayout>(null!);
export const useWindowMediaLayout = () => React.useContext(WindowMediaLayoutContext);

export interface WindowMediaLayoutProviderProps {
	/**
	 * NOTE: This prop should be outside of React.
	 * Array of pixel breakpoints, in increasing order, starting with 0.
	 * Indicates the lower end of a responsive range
	 * Example: [0, 500, 1200] creates ranges [0, 500) and [500, 1200) and [1200, ...]
	 * */
	lowerBreakpoints: number[];
	breakpointUnit: 'px' | 'rem';
}

type MediaQueryListTuple = [MediaQueryList, MediaQueryList];

export const WindowMediaLayoutProvider: React.FC<WindowMediaLayoutProviderProps> = (props) => {
	const { lowerBreakpoints, breakpointUnit } = props;

	// Portrait includes the square case.
	// https://developer.mozilla.org/en-US/docs/Web/CSS/@media/orientation
	const resizeQuery = React.useRef<MediaQueryList>(null!);
	if (resizeQuery.current === null) {
		resizeQuery.current = window.matchMedia('(orientation: portrait)');
	}

	const queries = React.useRef<MediaQueryListTuple[]>(null!);
	if (queries.current === null) {
		// First-time setup
		queries.current = lowerBreakpoints.map<MediaQueryListTuple>((lowerBreakpoint) => {
			return [
				window.matchMedia(`(min-width: ${lowerBreakpoint}${breakpointUnit})`),
				window.matchMedia(`(min-height: ${lowerBreakpoint}${breakpointUnit})`)
			];
		});
	}

	const [layout, setLayout] = React.useState<WindowLayout>(() => {
		return runQueries(lowerBreakpoints, queries.current, resizeQuery.current.matches, null);
	});

	React.useEffect(() => {
		function handleChange() {
			setLayout((p) => {
				return runQueries(lowerBreakpoints, queries.current, resizeQuery.current.matches, p);
			});
		}

		resizeQuery.current.addEventListener('change', handleChange);
		queries.current.forEach((query) => {
			const [width, height] = query;
			width.addEventListener('change', handleChange);
			height.addEventListener('change', handleChange);
		});

		return function () {
			resizeQuery.current.removeEventListener('change', handleChange);
			queries.current.forEach((query) => {
				const [width, height] = query;
				width.removeEventListener('change', handleChange);
				height.removeEventListener('change', handleChange);
			});
		};
	}, [lowerBreakpoints]);

	return (
		<WindowMediaLayoutContext.Provider value={layout}>
			{props.children}
		</WindowMediaLayoutContext.Provider>
	);
};

function runQueries(lowerBreakpoints: number[], queries: MediaQueryListTuple[], isPortrait: boolean, previous: WindowLayout | null): WindowLayout {

	let lastWidthIndex: number = 0;
	let lastHeightIndex: number = 0;
	for (let i = 0; i < queries.length; i++) {
		const [width, height] = queries[i];
		if (width.matches) {
			lastWidthIndex = i;
		}
		if (height.matches) {
			lastHeightIndex = i;
		}
	}

	const newLayout: WindowLayout = {
		widthBreakpoint: lowerBreakpoints[lastWidthIndex],
		heightBreakpoint: lowerBreakpoints[lastHeightIndex],
		orientation: isPortrait ? LayoutOrientation.portrait : LayoutOrientation.landscape,
	};

	if (previous) {
		if (newLayout.widthBreakpoint === previous.widthBreakpoint && newLayout.heightBreakpoint === previous.heightBreakpoint && newLayout.orientation === previous.orientation) {
			return previous;
		}
	}
	return newLayout;
}