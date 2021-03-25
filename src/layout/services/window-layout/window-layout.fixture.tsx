import * as React from 'react';
import { DefaultLayoutBreakpoint, defaultLowerBreakpoints, LayoutOrientation } from './window-layout';
import { useWindowDimensions, WindowDimensionsProvider } from './window-dimensions';
import { useWindowMediaLayout, WindowMediaLayoutProvider } from './window-layout-media';
import { useWindowPixelLayout, WindowPixelLayoutProvider } from './window-layout-pixel';
import { TestWrapper } from '@/test/decorate';

export default {
	'Window Pixel Layout': () => {
		return (
			<TestWrapper>
				<WindowDimensionsProvider>
					<WindowPixelLayoutProvider lowerBreakpoints={defaultLowerBreakpoints}>
						<InnerWindowPixelLayoutTest />
					</WindowPixelLayoutProvider>
				</WindowDimensionsProvider>
			</TestWrapper>
		);
	},
	'Window Media Layout': () => {

		return (
			<TestWrapper>
				<WindowMediaLayoutProvider lowerBreakpoints={defaultLowerBreakpoints} breakpointUnit='px'>
					<InnerWindowMediaLayoutTest />
				</WindowMediaLayoutProvider>
			</TestWrapper>
		);
	},
	'Both Layouts': () => {
		return (
			<TestWrapper>
				<WindowMediaLayoutProvider lowerBreakpoints={defaultLowerBreakpoints} breakpointUnit='px'>
					<WindowDimensionsProvider>
						<WindowPixelLayoutProvider lowerBreakpoints={defaultLowerBreakpoints}>
							<InnerWindowLayoutsTest />
						</WindowPixelLayoutProvider>
					</WindowDimensionsProvider>
				</WindowMediaLayoutProvider>
			</TestWrapper>
		);
	}
};

const InnerWindowPixelLayoutTest: React.FC = () => {
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
};

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
