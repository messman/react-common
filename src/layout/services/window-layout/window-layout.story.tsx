import * as React from 'react';
import { decorate } from '@/test/decorate';
import { DefaultLayoutBreakpoint, defaultLowerBreakpoints, LayoutOrientation } from './window-layout';
import { useWindowDimensions } from './window-dimensions';
import { useWindowMediaLayout, WindowMediaLayoutProvider } from './window-layout-media';
import { useWindowPixelLayout } from './window-layout-pixel';

export default { title: 'Layout/Services/Window Layout' };

export const TestWindowPixelLayout = decorate('Window Pixel Layout', () => {

	//const windowDimensions = useWindowDimensions();
	const windowLayout = useWindowPixelLayout();
	let invalidText: JSX.Element | null = null;
	if (windowLayout.heightBreakpoint < DefaultLayoutBreakpoint.regular) {
		invalidText = <p>Invalid Layout</p>;
	}

	return (
		<>
			<p>{LayoutOrientation[windowLayout.orientation]}</p>
			<p>width - {DefaultLayoutBreakpoint[windowLayout.widthBreakpoint]} ({windowLayout.widthBreakpoint})</p>
			<p>height - {DefaultLayoutBreakpoint[windowLayout.heightBreakpoint]} ({windowLayout.heightBreakpoint})</p>
			{invalidText}
		</>
	);
});

export const TestWindowMediaLayout = decorate('Window Media Layout', () => {

	return (
		<WindowMediaLayoutProvider lowerBreakpoints={defaultLowerBreakpoints} breakpointUnit='px'>
			<InnerWindowMediaLayoutTest />
		</WindowMediaLayoutProvider>
	);
}, true);

const InnerWindowMediaLayoutTest: React.FC = () => {
	const windowLayout = useWindowMediaLayout();
	let invalidText: JSX.Element | null = null;
	if (windowLayout.heightBreakpoint < DefaultLayoutBreakpoint.regular) {
		invalidText = <p>Invalid Layout</p>;
	}

	return (
		<>
			<p>{LayoutOrientation[windowLayout.orientation]}</p>
			<p>width - {DefaultLayoutBreakpoint[windowLayout.widthBreakpoint]} ({windowLayout.widthBreakpoint})</p>
			<p>height - {DefaultLayoutBreakpoint[windowLayout.heightBreakpoint]} ({windowLayout.heightBreakpoint})</p>
			{invalidText}
		</>
	);
};

export const TestWindowLayouts = decorate('Both Layouts', () => {
	return (
		<WindowMediaLayoutProvider lowerBreakpoints={defaultLowerBreakpoints} breakpointUnit='px'>
			<InnerWindowLayoutsTest />
		</WindowMediaLayoutProvider>
	);
});

const InnerWindowLayoutsTest: React.FC = () => {
	const windowDimensions = useWindowDimensions();
	const windowPixelLayout = useWindowPixelLayout();
	const windowMediaLayout = useWindowMediaLayout();
	let invalidText: JSX.Element | null = null;
	if (windowPixelLayout.heightBreakpoint < DefaultLayoutBreakpoint.regular) {
		invalidText = <p>Invalid Layout</p>;
	}

	return (
		<>
			<p>{LayoutOrientation[windowPixelLayout.orientation]}</p>
			<p>width - {windowDimensions.width}</p>
			<p>height - {windowDimensions.height}</p>
			<p>pixel width - {DefaultLayoutBreakpoint[windowPixelLayout.widthBreakpoint]} ({windowPixelLayout.widthBreakpoint})</p>
			<p>pixel height - {DefaultLayoutBreakpoint[windowPixelLayout.heightBreakpoint]} ({windowPixelLayout.heightBreakpoint})</p>
			<p>media width - {DefaultLayoutBreakpoint[windowMediaLayout.widthBreakpoint]} ({windowMediaLayout.widthBreakpoint})</p>
			<p>media height - {DefaultLayoutBreakpoint[windowMediaLayout.heightBreakpoint]} ({windowMediaLayout.heightBreakpoint})</p>
			{invalidText}
		</>
	);
};
