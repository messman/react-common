import * as React from 'react';
import { useRefEffect } from '@/utility/ref-effect/ref-effect';
import { ResizeObserver, ResizeObserverEntry } from './resize-observer';

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
 * Efficiently measures the width and height of an element as it changes, with more than a few drawbacks. Useful for custom UI drawing.
 * Uses the ResizeObserver API, so it responds even when the size change does not come from window resize.
 * Drawbacks!
 * - Browser support is not great. Works in iOS 13.5, but not iOS <= 13.3 (Early 2020). https://caniuse.com/#feat=resizeobserver
 * - Your element should have no margin, border, or padding.
 * - You likely need to break collapsed margins. You can do so easily with float, inline-block, flex, or non-default overflow.
 */
export function useElementSize<T extends HTMLElement>(): [React.RefCallback<T>, ElementSize] {
	// We know this is always the same.
	const elementSizeObserver = getElementSizeObserver();

	const [size, setSize] = React.useState(defaultElementSize);

	// Used to prevent events handled after cleanup.
	const isHandlingEvents = React.useRef(false);

	const ref = useRefEffect((element) => {
		isHandlingEvents.current = true;

		function trySetSize(width: number, height: number): void {
			const roundedWidth = Math.round(width);
			const roundedHeight = Math.round(height);
			setSize((p) => {
				if (p.width === roundedWidth && p.height === roundedHeight) {
					return p;
				}
				return {
					width: roundedWidth,
					height: roundedHeight
				};
			});
		}

		function onSizeChanged(entry: ResizeObserverEntry) {
			if (!isHandlingEvents.current) {
				return;
			}
			trySetSize(entry.contentRect.width, entry.contentRect.height);
		}

		elementSizeObserver.subscribe(element, onSizeChanged);
		const rect = element.getBoundingClientRect();
		trySetSize(rect.width, rect.height);

		return () => {
			isHandlingEvents.current = false;
			elementSizeObserver.unsubscribe(element);
			setSize(defaultElementSize);
		};
	}, [elementSizeObserver]);

	return [ref, size];
};

interface ElementSizeObserver {
	subscribe: (element: Element, callback: ElementSizeObserverCallback) => void;
	unsubscribe: (element: Element) => void;
}

interface ElementSizeObserverCallback {
	(entry: ResizeObserverEntry): void;
}

function createElementSizeObserver(): ElementSizeObserver {
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

function getElementSizeObserver(): ElementSizeObserver {
	if (!elementSizeObserver) {
		elementSizeObserver = createElementSizeObserver();
	}
	return elementSizeObserver;
}
