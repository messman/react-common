import * as React from 'react';
import { useRefLayoutEffect } from '@/utility/ref-effect/ref-effect';
import { useLatestForLayoutEffect } from '@/utility/render/render';

/*
	Uses the IntersectionObserver API: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
	Primary differences over scroll check code:
		- code to check for intersections does not run on the main thread - way faster this way.
	
	Examples: https://www.smashingmagazine.com/2018/01/deferring-lazy-loading-intersection-observer-api/

	More info: https://css-tricks.com/an-explanation-of-how-the-intersection-observer-watches/
*/

/**
 * Creates a threshold array including 0, 1, and other numbers in between with the provided distance.
 * Useful for increasing the 'resolution' of the intersect observer. 
 * Ex: 3 => [0, .33, .66, 1]
*/
export function createThreshold(sections?: number): number[] {
	sections = sections || 1;
	const ratio = 1 / sections;
	const thresholds = [];
	for (let i = 0; i <= 1; i += ratio) {
		thresholds.push(i);
	}
	return thresholds;
}

const defaultThreshold = createThreshold();

export interface ElementIntersectOptions extends Pick<IntersectionObserverInit, 'rootMargin' | 'threshold'> {
	/**
	 * The root element should be an ancestor of the target element. However, if the root is in a parent *component*, then this ref won't yet be set.
	 * If that's your issue, you need to react to changes in the root element, so use the other root option.
	 */
	rootRef?: React.MutableRefObject<any>;
	/**
	 * Used when not supplying the element via a ref.
	 */
	rootElement?: HTMLElement | null;
}

export interface ElementIntersect extends IntersectionObserverEntry {
	top: ElementIntersectRelativePosition;
	bottom: ElementIntersectRelativePosition;
	left: ElementIntersectRelativePosition;
	right: ElementIntersectRelativePosition;
}

export interface ElementIntersectRelativePosition {
	/** Meaning, the target is seen before the root from left to right, top to bottom. */
	isBefore: boolean;
	/** Meaning, the target is seen after the root from left to right, top to bottom. */
	isAfter: boolean;
	isIntersecting: boolean;
}

/**
 * Tracks intersection of a target element with the viewport or with a root element.
 * Returns the target ref.
 * 
 * NOTES:
 * - Make sure your threshold input value is an unchanging reference - else this hook will always restart itself.
 * - There is no cleanup call to the callback.
 */
export function useElementIntersect(observerOptions: ElementIntersectOptions, callback: (intersect: ElementIntersect) => void): React.RefObject<any> {

	const { rootRef, rootElement, rootMargin, threshold } = observerOptions;

	// Always use the latest version of the callback that is supplied.
	const latestCallback = useLatestForLayoutEffect(callback);

	const targetElementRef = useRefLayoutEffect((targetElement: HTMLElement) => {
		if (!targetElement) {
			return;
		}
		const effectRootElement = rootElement || rootRef?.current || null;
		let isCleanedUp = false;

		function onChange(entry: IntersectionObserverEntry) {
			if (!isCleanedUp && targetElement.isConnected) {
				latestCallback.current(createElementIntersect(entry));
			}
		}

		const observer = createElementIntersectObserver({
			root: effectRootElement,
			rootMargin: rootMargin,
			threshold: threshold || defaultThreshold
		});
		// console.log({
		// 	root: effectRootElement,
		// 	rootMargin: rootMargin,
		// 	threshold: threshold || defaultThreshold
		// });
		observer.observe(targetElement, onChange);

		return () => {
			observer.unobserve(targetElement);
			isCleanedUp = true;
		};
	}, [rootMargin, threshold, rootElement]);

	return targetElementRef;
};

function noop() { };

/**
 * Tracks intersection of a target element with the viewport or with a root element.
 * Returns an array of [targetRef, rootRef]. If rootRef is not applied to an element, then the viewport is used. The root element must be an ancestor of the target.
 * 
 * NOTES:
 * - Make sure your threshold input value is an unchanging reference - else this hook will always restart itself.
 * - There is no cleanup call to the callback.
 */
export function useControlledElementIntersect(observerOptions: ElementIntersectOptions, callback?: (intersect: ElementIntersect) => void): [React.RefObject<any>, ElementIntersect | null] {

	const [elementIntersect, setElementIntersect] = React.useState<ElementIntersect | null>(null);
	const latestCallback = useLatestForLayoutEffect(callback || noop);
	const targetRef = useElementIntersect(observerOptions, (elementIntersect) => {
		latestCallback.current(elementIntersect);
		setElementIntersect(elementIntersect);
	});

	return [targetRef, elementIntersect];
};


function createElementIntersect(entry: IntersectionObserverEntry): ElementIntersect {
	const { boundingClientRect, rootBounds, isIntersecting } = entry;

	const hasRects = !!boundingClientRect && !!rootBounds;

	// 'Before' means 'Above' or 'To The Left Of'.
	const topIsBefore: boolean = hasRects && boundingClientRect.top < rootBounds!.top;
	const topIsAfter: boolean = hasRects && boundingClientRect.top > rootBounds!.bottom;
	const rightIsBefore: boolean = hasRects && boundingClientRect.right < rootBounds!.left;
	const rightIsAfter: boolean = hasRects && boundingClientRect.right > rootBounds!.right;
	const bottomIsBefore: boolean = hasRects && boundingClientRect.bottom < rootBounds!.top;
	const bottomIsAfter: boolean = hasRects && boundingClientRect.bottom > rootBounds!.bottom;
	const leftIsBefore: boolean = hasRects && boundingClientRect.left < rootBounds!.left;
	const leftIsAfter: boolean = hasRects && boundingClientRect.left > rootBounds!.right;

	return {
		// Cannot use rest operator here because of the type of object that the entry is (I guess).
		time: entry.time,
		target: entry.target,
		isIntersecting: entry.isIntersecting,
		rootBounds: entry.rootBounds,
		intersectionRatio: entry.intersectionRatio,
		boundingClientRect: entry.boundingClientRect,
		intersectionRect: entry.intersectionRect,
		top: {
			isBefore: topIsBefore,
			isAfter: topIsAfter,
			isIntersecting: isIntersecting && !topIsBefore && !topIsAfter
		},
		right: {
			isBefore: rightIsBefore,
			isAfter: rightIsAfter,
			isIntersecting: isIntersecting && !rightIsBefore && !rightIsAfter
		},
		bottom: {
			isBefore: bottomIsBefore,
			isAfter: bottomIsAfter,
			isIntersecting: isIntersecting && !bottomIsBefore && !bottomIsAfter
		},
		left: {
			isBefore: leftIsBefore,
			isAfter: leftIsAfter,
			isIntersecting: isIntersecting && !leftIsBefore && !leftIsAfter
		}
	};
}

/*
	Like with ResizeObserver, we want to tweak the API a bit. We'd prefer to bind a callback to an element implicitly and take that out of our consuming code.
	
	TODO: On top of that, we might want to use an optimization to always return the same observer if the init options reference is exactly the same. We could use a WeakMap for that.
*/

interface ElementIntersectObserver {
	observe: (element: Element, callback: ElementIntersectObserverCallback) => void;
	unobserve: (element: Element) => void;
}

interface ElementIntersectObserverCallback {
	(intersectionObserverEntry: IntersectionObserverEntry): void;
}

export function createElementIntersectObserver(init: IntersectionObserverInit): ElementIntersectObserver {
	const callbacks: Map<Element, ElementIntersectObserverCallback> = new Map();

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const matchingCallback = callbacks.get(entry.target);
			if (matchingCallback) {
				matchingCallback(entry);
			}
		});
	}, init);

	return {
		observe: function (element, callback) {
			if (callbacks.has(element)) {
				throw new Error('IntersectObserver already contains an entry for provided element');
			}
			callbacks.set(element, callback);
			observer.observe(element);
		},
		unobserve: function (element) {
			const didDelete = callbacks.delete(element);
			if (didDelete) {
				observer.unobserve(element);
			}
		}
	};
};