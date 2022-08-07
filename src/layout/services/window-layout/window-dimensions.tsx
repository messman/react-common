import * as React from 'react';
import { addMediaEventListener, removeMediaEventListener } from './window-layout-media';

export interface WindowDimensions {
	width: number;
	height: number;
}

/*
	Unfortunately, checking for resize events isn't perfect.
	The code below works for iOS Safari by explicitly *not* relying on the old orientationchanged event, which is always "late" 
	and provides width/height from *before* the event half the time.
	This is fixed by only relying on resize, visibilitychange, and the MediaQuery for orientation.
	Also, we use document.documentElement.clientWidth instead of window.innerWidth, which seems to respond correctly.
*/

const WindowDimensionsContext = React.createContext<WindowDimensions>(null!);
export const WindowDimensionsProvider: React.FC<React.PropsWithChildren> = (props) => {
	const [dimensions, setDimensions] = React.useState<WindowDimensions>({
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight,
	});
	const resizeMQL = React.useRef(window.matchMedia('(orientation: portrait)'));

	React.useEffect(() => {

		function checkDimensions(): void {
			const newWidth = document.documentElement.clientWidth;
			const newHeight = document.documentElement.clientHeight;
			setDimensions((p) => {
				if (newWidth === p.width && newHeight === p.height) {
					return p;
				}
				return {
					width: newWidth,
					height: newHeight,
				};
			});
		}

		if (resizeMQL.current) {
			addMediaEventListener(resizeMQL.current, checkDimensions);
		}
		window.addEventListener('resize', checkDimensions);
		window.addEventListener('visibilitychange', checkDimensions);
		return function () {
			if (resizeMQL.current) {
				removeMediaEventListener(resizeMQL.current, checkDimensions);
			}
			window.removeEventListener('resize', checkDimensions);
			window.removeEventListener('visibilitychange', checkDimensions);
		};
	}, []);

	return (
		<WindowDimensionsContext.Provider value={dimensions}>
			{props.children}
		</WindowDimensionsContext.Provider>
	);
};
export const useWindowDimensions = () => React.useContext(WindowDimensionsContext);