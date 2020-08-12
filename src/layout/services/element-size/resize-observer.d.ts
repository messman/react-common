/*
	TypeScript doesn't contain these typings yet. Remove when they have them.
	https://github.com/microsoft/TypeScript/issues/37861
*/

export declare class ResizeObserver {
	constructor(callback: ResizeObserverCallback);
	disconnect: () => void;
	observe: (target: Element, options?: ResizeObserverObserveOptions) => void;
	unobserve: (target: Element) => void;
}

export interface ResizeObserverObserveOptions {
	box?: 'content-box' | 'border-box';
}

export type ResizeObserverCallback = (
	entries: ResizeObserverEntry[],
	observer: ResizeObserver,
) => void;

export interface ResizeObserverEntry {
	readonly borderBoxSize: ResizeObserverEntryBoxSize;
	readonly contentBoxSize: ResizeObserverEntryBoxSize;
	readonly contentRect: DOMRectReadOnly;
	readonly target: Element;
}

export interface ResizeObserverEntryBoxSize {
	blockSize: number;
	inlineSize: number;
}