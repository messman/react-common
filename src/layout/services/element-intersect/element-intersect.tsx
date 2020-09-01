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

export interface ElementIntersectOptions extends Pick<IntersectionObserverInit, 'rootMargin' | 'threshold'> {
	useRoot: boolean;
}

export interface ElementIntersect extends IntersectionObserverEntry {
	isTopVisible: boolean;
	isBottomVisible: boolean;
	isLeftVisible: boolean;
	isRightVisible: boolean;
}

/**
 * Tracks intersection of a target element with the viewport or with a root element.
 * Returns an array of [targetRef, rootRef]. If rootRef is not applied to an element, then the viewport is used. The root element must be an ancestor of the target.
 * 
 * NOTES:
 * - Make sure your threshold input value is an unchanging reference - else this hook will always restart itself.
 * - There is no cleanup call to the callback.
 */
export function useElementIntersect(observerOptions: ElementIntersectOptions, callback: (intersect: ElementIntersect) => void): [React.RefObject<any>, React.RefObject<any>] {

	const { useRoot, rootMargin, threshold } = observerOptions;

	// Always use the latest version of the callback that is supplied.
	const latestCallback = useLatestForLayoutEffect(callback);

	// The root element should be an ancestor of the target element - so we hopefully can assume that if the root element changes, so will the target.
	// This would mean we don't have to add some hacky logic to handle changes of the ancestor but not the target.
	const rootElementRef = React.useRef<any>(null);

	const targetElementRef = useRefLayoutEffect((targetElement: HTMLElement) => {
		if (!targetElement) {
			return;
		}
		let isCleanedUp = false;
		const rootElement = useRoot ? (rootElementRef.current || null) : null;

		function onChange(entry: IntersectionObserverEntry) {
			if (!isCleanedUp) {

				let isTopVisible = false;
				let isBottomVisible = false;
				let isLeftVisible = false;
				let isRightVisible = false;
				const { boundingClientRect, intersectionRect, isIntersecting } = entry;
				if (isIntersecting && boundingClientRect && intersectionRect) {
					isTopVisible = boundingClientRect.top >= intersectionRect.top;
					isBottomVisible = boundingClientRect.bottom <= intersectionRect.bottom;
					isLeftVisible = boundingClientRect.left >= intersectionRect.left;
					isRightVisible = boundingClientRect.right <= intersectionRect.right;
				}

				const intersect: ElementIntersect = {
					// Cannot use rest operator here because of the type of object that the entry is (I guess).
					time: entry.time,
					target: entry.target,
					isIntersecting: entry.isIntersecting,
					rootBounds: entry.rootBounds,
					boundingClientRect: entry.boundingClientRect,
					intersectionRatio: entry.intersectionRatio,
					intersectionRect: entry.intersectionRect,
					isTopVisible: isTopVisible,
					isBottomVisible: isBottomVisible,
					isLeftVisible: isLeftVisible,
					isRightVisible: isRightVisible
				};

				latestCallback.current(intersect);
			}
		}

		const observer = createElementIntersectObserver({
			root: rootElement,
			rootMargin: rootMargin,
			threshold: threshold
		});
		observer.observe(targetElement, onChange);

		return () => {
			observer.unobserve(targetElement);
			isCleanedUp = true;
		};
	}, [useRoot, rootMargin, threshold]);

	return [targetElementRef, rootElementRef];
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
export function useControlledElementIntersect(observerOptions: ElementIntersectOptions, callback?: (intersect: ElementIntersect) => void): [React.RefObject<any>, ElementIntersect | null, React.RefObject<any>] {

	const [elementIntersect, setElementIntersect] = React.useState<ElementIntersect | null>(null);
	const latestCallback = useLatestForLayoutEffect(callback || noop);
	const [targetRef, rootRef] = useElementIntersect(observerOptions, (elementIntersect) => {
		latestCallback.current(elementIntersect);
		setElementIntersect(elementIntersect);
	});

	return [targetRef, elementIntersect, rootRef];
};

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