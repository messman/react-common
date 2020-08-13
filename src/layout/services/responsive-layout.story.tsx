import * as React from 'react';
import { decorate } from '@/test/decorate';
import { useResponsiveLayout, LayoutBreakpoint, LayoutMode } from './responsive-layout';

export default { title: 'Layout/Services' };

export const TestResponsive = decorate('Responsive', () => {

	const responsiveLayout = useResponsiveLayout();
	let invalidText: JSX.Element | null = null;
	if (responsiveLayout.widthBreakpoint < LayoutBreakpoint.compact) {
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
