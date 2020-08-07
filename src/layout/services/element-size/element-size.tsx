import * as React from 'react';
import { useRefEffect } from '@/utility/ref-effect/ref-effect';

/*
	Inspired by https://github.com/jaredLunde/react-hook/tree/master/packages/resize-observer
	And by https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node

	Notes on ResizeObserver:
	- Apparently re-using the same one is more performant: https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/z6ienONUb5A/F5-VcUZtBAAJ
	- According to the spec, when observer.observe is called and that element is already being observed, the first observation entry is discarded.
		Meaning, you can only observe an element one time per observer. That's no big deal. https://www.w3.org/TR/resize-observer/#resize-observer-interface
	- ResizeObserver is pretty new and isn't in the included TypeScript types yet. https://github.com/microsoft/TypeScript/issues/37861
	- ResizeObserver needs to be applied to an element with no margin or border or padding.
	- ResizeObserver doesn't really get the location right. 

	You can use overflow to break collapsed margins on the div you measure.
*/

export interface ElementSize {
	width: number;
	height: number;
}

const defaultElementSize: ElementSize = {
	width: -1,
	height: -1
};

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

interface ResizeObserverEntry {
	readonly borderBoxSize: ResizeObserverEntryBoxSize;
	readonly contentBoxSize: ResizeObserverEntryBoxSize;
	readonly contentRect: DOMRectReadOnly;
	readonly target: Element;
}

interface ResizeObserverEntryBoxSize {
	blockSize: number;
	inlineSize: number;
}

// https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
export function useElementSize<T extends HTMLElement>(): [React.RefCallback<T>, ElementSize] {
	// We know this is always the same.
	const elementSizeObserver = getElementSizeObserver();

	const [size, setSize] = React.useState(defaultElementSize);
	const isMounted = React.useRef(false);

	const ref = useRefEffect((element) => {
		isMounted.current = true;

		function onSizeChanged(entry: ResizeObserverEntry) {
			if (!isMounted.current) {
				return;
			}
			const width = Math.round(entry.contentRect.width);
			const height = Math.round(entry.contentRect.height);
			setSize((p) => {
				if (p.width === width && p.height === height) {
					return p;
				}
				return {
					width: width,
					height: height
				};
			});
		}

		elementSizeObserver.subscribe(element, onSizeChanged);
		const rect = element.getBoundingClientRect();
		const width = Math.round(rect.width);
		const height = Math.round(rect.height);
		setSize({
			width: width,
			height: height
		});

		return () => {
			isMounted.current = false;
			elementSizeObserver.unsubscribe(element);
			setSize(defaultElementSize);
		};
	}, []);

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

export type UseResizeObserverCallback = (
	entry: ResizeObserverEntry,
	observer: ResizeObserver
) => any;