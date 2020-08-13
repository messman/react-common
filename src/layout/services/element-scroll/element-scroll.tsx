import * as React from 'react';
import { getGlobalElementSizeObserver, ResizeObserverEntry } from '../element-size/element-size';
import { useRefLayoutEffect } from '@/utility/ref-effect/ref-effect';

export interface ElementScroll {
	/** How far from the left the element is scrolled. */
	scrollLeft: number;
	/** How far from the top the element is scrolled. */
	scrollTop: number;
	/** The element's content width. */
	width: number;
	/** The element's content height. */
	height: number;
	/**
	 * The maximum possible value for scrolling from the left.
	 * Add to the element width to get the full scrollWidth.
	 * */
	scrollLeftMax: number;
	/**
	 * The maximum possible value for scrolling from the top.
	 * Add to the element height to get the full scrollHeight.
	 * */
	scrollTopMax: number;
}

const defaultElementScroll: ElementScroll = {
	scrollLeft: 0,
	scrollTop: 0,
	width: -1,
	height: -1,
	scrollLeftMax: 0,
	scrollTopMax: 0
};

/**
	Measures the scroll data for an element and updates when changed.
	Also hooks into ResizeObserver to report on width and height.
	See useElementSize for drawbacks.
 */
export function useElementScroll(throttle: number): [React.RefObject<any>, ElementScroll] {

	const [elementScroll, setElementScroll] = React.useState(defaultElementScroll);

	// We know this is always the same.
	const elementSizeObserver = getGlobalElementSizeObserver();

	const throttleIdRef = React.useRef(-1);

	const ref = useRefLayoutEffect((element: HTMLElement) => {
		if (!element) {
			return;
		}
		let isCleanedUp = false;

		function onChange() {
			if (throttle === 0) {
				updateState();
			}
			else if (throttleIdRef.current === -1) {
				throttleIdRef.current = window.setTimeout(updateState, throttle);
			}
		}

		function updateState() {
			throttleIdRef.current = -1;
			if (isCleanedUp) {
				return;
			}
			const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientHeight, clientWidth } = element;
			const scrollLeftMax = scrollWidth - clientWidth;
			const scrollTopMax = scrollHeight - clientHeight;
			setElementScroll({
				width: clientWidth,
				height: clientHeight,
				scrollLeft: Math.max(scrollLeft, 0),
				scrollTop: Math.max(scrollTop, 0),
				scrollLeftMax: Math.max(scrollLeftMax, 0),
				scrollTopMax: Math.max(scrollTopMax, 0)
			});
		}

		elementSizeObserver.subscribe(element, (_: ResizeObserverEntry) => {
			onChange();
		});
		element.onscroll = function (e: Event) {
			if (e.target !== element) {
				return;
			}
			onChange();
		};

		updateState();

		return () => {
			if (throttleIdRef.current !== -1) {
				window.clearTimeout(throttleIdRef.current);
				throttleIdRef.current = -1;
			}
			elementSizeObserver.unsubscribe(element);
			element.onscroll = null;
			setElementScroll(defaultElementScroll);
			isCleanedUp = true;
		};
	}, [elementSizeObserver, throttle]);

	return [ref, elementScroll];
};