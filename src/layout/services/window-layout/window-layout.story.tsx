import * as React from 'react';
import { decorate } from '@/test/decorate';
import { useWindowLayout, DefaultLayoutBreakpoint, LayoutOrientation } from './window-layout';
import { useWindowDimensions } from './window-dimensions';

export default { title: 'Layout/Services/Window Layout' };

export const TestWindowLayout = decorate('Window Layout', () => {

	const windowDimensions = useWindowDimensions();
	const windowLayout = useWindowLayout();
	let invalidText: JSX.Element | null = null;
	if (windowLayout.heightBreakpoint < DefaultLayoutBreakpoint.regular) {
		invalidText = <p>Invalid Layout</p>;
	}

	return (
		<>
			<p>{LayoutOrientation[windowLayout.orientation]}</p>
			<p>width - {windowDimensions.width} - {DefaultLayoutBreakpoint[windowLayout.widthBreakpoint]} ({windowLayout.widthBreakpoint})</p>
			<p>height - {windowDimensions.height} - {DefaultLayoutBreakpoint[windowLayout.heightBreakpoint]} ({windowLayout.heightBreakpoint})</p>
			{invalidText}
		</>
	);
});
