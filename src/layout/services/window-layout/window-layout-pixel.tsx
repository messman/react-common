import * as React from 'react';
import { useWindowDimensions, WindowDimensions } from './window-dimensions';
import { LayoutOrientation, WindowLayout } from './window-layout';

function getLayout(dimensions: WindowDimensions, lowerBreakpoints: number[]): WindowLayout {

	const lowest = lowerBreakpoints[0];
	let newWidthBreakpoint = lowest;
	let newHeightBreakpoint = lowest;
	// Loop through breakpoints from largest to smallest looking for the largest match`
	for (let i = lowerBreakpoints.length - 1; i >= 0; i--) {
		const breakpoint = lowerBreakpoints[i];
		if (newWidthBreakpoint === lowest && dimensions.width >= breakpoint) {
			newWidthBreakpoint = breakpoint;
		}
		if (newHeightBreakpoint === lowest && dimensions.height >= breakpoint) {
			newHeightBreakpoint = breakpoint;
		}
	}

	const newOrientation = dimensions.width > dimensions.height ? LayoutOrientation.landscape : LayoutOrientation.portrait;

	return {
		widthBreakpoint: newWidthBreakpoint,
		heightBreakpoint: newHeightBreakpoint,
		orientation: newOrientation
	};
}

const WindowPixelLayoutContext = React.createContext<WindowLayout>(null!);
export const useWindowPixelLayout = () => React.useContext(WindowPixelLayoutContext);

export interface WindowPixelLayoutProviderProps {
	/**
	 * Array of pixel breakpoints, in increasing order, starting with 0.
	 * Indicates the lower end of a responsive range
	 * Example: [0, 500, 1200] creates ranges [0, 500) and [500, 1200) and [1200, ...]
	 * */
	lowerBreakpoints: number[];
}

export const WindowPixelLayoutProvider: React.FC<WindowPixelLayoutProviderProps> = (props) => {

	const dimensions = useWindowDimensions();
	const [layout, setLayout] = React.useState<WindowLayout>(() => {
		return getLayout(dimensions, props.lowerBreakpoints);
	});

	React.useEffect(() => {
		const newLayout = getLayout(dimensions, props.lowerBreakpoints);
		setLayout((p) => {
			if (newLayout.widthBreakpoint === layout.widthBreakpoint && newLayout.heightBreakpoint === layout.heightBreakpoint && newLayout.orientation === layout.orientation) {
				return p;
			}
			return newLayout;
		});
	}, [dimensions.width, dimensions.height]);

	return (
		<WindowPixelLayoutContext.Provider value={layout}>
			{props.children}
		</WindowPixelLayoutContext.Provider>
	);
};