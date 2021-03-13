export enum DefaultLayoutBreakpoint {
	compact = 0,
	regular = 500,
	desktop = 900,
	wide = 1200
}
export const defaultLowerBreakpoints: number[] = [DefaultLayoutBreakpoint.compact, DefaultLayoutBreakpoint.regular, DefaultLayoutBreakpoint.desktop, DefaultLayoutBreakpoint.wide];

export enum LayoutOrientation {
	/** Includes the square case. */
	portrait,
	landscape
}

export interface WindowLayout {
	/** The number value of the first breakpoint provided that matches, in the breakpoint unit. */
	widthBreakpoint: number;
	/** The number value of the first breakpoint provided that matches, in the breakpoint unit. */
	heightBreakpoint: number;
	orientation: LayoutOrientation;
}
