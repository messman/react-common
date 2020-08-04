import * as React from 'react';
import { decorate } from '@/test/decorate';
import { useResponsiveLayout, LayoutBreakpoint, LayoutMode, isInvalidLayoutForApplication } from './responsive-layout';

export default { title: 'services/layout' };

export const TestResponsive = decorate(() => {

	const responsiveLayout = useResponsiveLayout();
	let invalidText: JSX.Element | null = null;
	if (isInvalidLayoutForApplication(responsiveLayout)) {
		invalidText = <p>Invalid Layout</p>;
	}

	return (
		<>
			<p>{LayoutMode[responsiveLayout.mode]}</p>
			<p>width - {LayoutBreakpoint[responsiveLayout.widthBreakpoint]} ({responsiveLayout.widthBreakpoint})</p>
			<p>height - {LayoutBreakpoint[responsiveLayout.heightBreakpoint]} ({responsiveLayout.heightBreakpoint})</p>
			{invalidText}
		</>
	);
});
