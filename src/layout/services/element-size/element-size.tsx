import * as React from 'react';
import { useRefLayoutEffect } from '@/utility/ref-effect/ref-effect';
import { useLatestForLayoutEffect } from '@/utility/render/render';

/*
	Inspired by https://github.com/jaredLunde/react-hook/tree/master/packages/resize-observer
	And by https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node

	Notes on ResizeObserver:
	- Apparently re-using the same one is more performant: https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/z6ienONUb5A/F5-VcUZtBAAJ
	- According to the spec, when observer.observe is called and that element is already being observed, the first observation entry is discarded.
		Meaning, you can only observe an element one time per observer. That's no big deal. https://www.w3.org/TR/resize-observer/#resize-observer-interface
	- ResizeObserver needs to be applied to an element with no margin or border or padding.
	- ResizeObserver doesn't really get the location right. 

	You can use overflow to break collapsed margins on the div you measure.
*/

/** Size of the content of the element. */
export interface ElementSize {
	/** Width. */
	width: number;
	/** Height. */
	height: number;
}

const defaultElementSize: ElementSize = {
	width: -1,
	height: -1
};

/**
 * Efficiently measures the width and height of an element as it changes. Useful for custom UI drawing.
 * This hook responds to all events and does not remember previous sizes.
 * Uses the ResizeObserver API, so it responds even when the size change does not come from window resize.
 * Drawbacks:
 * - Browser support is not great. Works in iOS 13.5, but not iOS <= 13.3 (Early 2020). https://caniuse.com/#feat=resizeobserver
 * - Your element should have no margin, border, or padding.
 * - You likely need to break collapsed margins. You can do so easily with float, inline-block, flex, or non-default overflow.
 * - Works on whole pixels only.
 */
export function useElementSize(throttle: number, callback: (width: number, height: number, element: HTMLElement) => void): React.RefObject<any> {
	// We know this is always the same.
	const elementSizeObserver = getGlobalElementSizeObserver();

	const throttleIdRef = React.useRef(-1);

	// Always use the latest version of the callback that is supplied.
	const latestCallback = useLatestForLayoutEffect(callback);

	const ref = useRefLayoutEffect((element: HTMLElement) => {
		if (!element) {
			return;
		}

		let isCleanedUp = false;

		function onChange() {
			throttleIdRef.current = -1;
			if (!isCleanedUp) {
				latestCallback.current(element.clientWidth, element.clientHeight, element);
			}
		}

		elementSizeObserver.subscribe(element, (_: ResizeObserverEntry) => {
			if (!throttle) {
				onChange();
			}
			else if (throttleIdRef.current === -1) {
				throttleIdRef.current = window.setTimeout(onChange, throttle);
			}
		});

		onChange();

		return () => {
			if (throttleIdRef.current !== -1) {
				window.clearTimeout(throttleIdRef.current);
				throttleIdRef.current = -1;
			}
			elementSizeObserver.unsubscribe(element);
			latestCallback.current(defaultElementSize.width, defaultElementSize.height, element);
			isCleanedUp = true;
		};
	}, [elementSizeObserver, throttle]);

	return ref;
};

function noop() { };
/**
 * Efficiently measures the width and height of an element as it changes, with more than a few drawbacks. Useful for custom UI drawing.
 * Uses the ResizeObserver API, so it responds even when the size change does not come from window resize.
 * Drawbacks:
 * - Browser support is not great. Works in iOS 13.5, but not iOS <= 13.3 (Early 2020). https://caniuse.com/#feat=resizeobserver
 * - Your element should have no margin, border, or padding.
 * - You likely need to break collapsed margins. You can do so easily with float, inline-block, flex, or non-default overflow.
 * - Works on whole pixels only.
 */
export function useControlledElementSize(throttle: number, callback?: (width: number, height: number, element: HTMLElement) => void): [React.RefObject<any>, ElementSize] {

	const [size, setSize] = React.useState(defaultElementSize);

	const latestCallback = useLatestForLayoutEffect(callback || noop);

	const ref = useElementSize(throttle, (newWidth, newHeight, element) => {
		latestCallback.current(newWidth, newHeight, element);
		setSize((p) => {
			if (p.width === newWidth && p.height === newHeight) {
				return p;
			}
			return {
				width: newWidth,
				height: newHeight
			};
		});
	});

	return [ref, size];
};

interface ElementSizeObserver {
	subscribe: (element: Element, callback: ElementSizeObserverCallback) => void;
	unsubscribe: (element: Element) => void;
}

interface ElementSizeObserverCallback {
	(resizeObserverEntry: any): void;
}

export function createElementSizeObserver(): ElementSizeObserver {
	// By to my research, you can only ever target an element once.
	// That's fine by me, as it would get too confusing anyway considering you can pass different options.
	const callbacks: Map<Element, ElementSizeObserverCallback> = new Map();

	const observer = new ResizeObserver((entries) => {
		entries.forEach((entry) => {
			const matchingCallback = callbacks.get(entry.target);
			if (matchingCallback) {
				matchingCallback(entry);
			}
		});
	});

	return {
		subscribe: function (element, callback) {
			if (callbacks.has(element)) {
				throw new Error('ResizeObserver already contains an entry for provided element');
			}
			callbacks.set(element, callback);
			observer.observe(element);
		},
		unsubscribe: function (element) {
			const didDelete = callbacks.delete(element);
			if (didDelete) {
				observer.unobserve(element);
			}
		}
	};
};

let elementSizeObserver: ElementSizeObserver = null!;

export function getGlobalElementSizeObserver(): ElementSizeObserver {
	if (!elementSizeObserver) {
		elementSizeObserver = createElementSizeObserver();
	}
	return elementSizeObserver;
}


//////////////////////

/*
	TypeScript doesn't contain these typings yet. Remove when they have them.
	https://github.com/microsoft/TypeScript/issues/37861
*/

declare class ResizeObserver {
	constructor(callback: ResizeObserverCallback);
	disconnect: () => void;
	observe: (target: Element, options?: ResizeObserverObserveOptions) => void;
	unobserve: (target: Element) => void;
}

interface ResizeObserverObserveOptions {
	box?: 'content-box' | 'border-box';
}

type ResizeObserverCallback = (
	entries: ResizeObserverEntry[],
	observer: ResizeObserver,
) => void;

export interface ResizeObserverEntry {
	readonly borderBoxSize: ResizeObserverEntryBoxSize;
	readonly contentBoxSize: ResizeObserverEntryBoxSize;
	readonly contentRect: DOMRectReadOnly;
	readonly target: Element;
}

interface ResizeObserverEntryBoxSize {
	blockSize: number;
	inlineSize: number;
}