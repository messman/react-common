import * as React from 'react';

/*
	Essentially, it's hard to know when a ref is about to be gone. Maybe we need to clean up with it.
	To handle that, we use a combination of useRef and useCallback for a callback ref.

	Note the downside:
	This callback function is run between the render and effect phases, so it can't always use values from other effects.
	To fix this, you might want your effect to set the element to a state variable, then use a separate useEffect / useLayoutEffect
	to handle your logic (though that costs a render).


	Inspiration / explanation of issues:
	https://github.com/facebook/react/issues/15176

	Related:
	https://github.com/facebook/react/issues/16154

	Callback Refs:
	https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
*/

type CleanupRefFunc = null | void | (() => void | undefined);

export type RefEffectCallback = <T extends HTMLElement>(element: T) => CleanupRefFunc;

/*
	I know, I know. None of this is best practice. Don't do any of this. Too many refs, too many workarounds.
*/

/**
 * Allows an effect-like way to access an element, including cleanup.
 * Exposes an element in useLayoutEffect and runs the effect when the element (or dependencies) change.
 * Runs cleanup as part of the effect, so you cannot rely on preservation of order of cleanup for effects in your logic.
 * Use only when cleanup is needed for an element; otherwise, use a regular ref.
 */
export function useRefLayoutEffect<T extends HTMLElement>(effect: RefEffectCallback, deps?: React.DependencyList): React.RefObject<T | any> {

	const elementRef = React.useRef<T | null>(null);
	const previousElementRef = React.useRef<T | null>(null);
	// This ref does double-duty as the way to tell when we are cleaning up as well as holding that cleanup function.
	const cleanupRef = React.useRef<CleanupRefFunc>(null);
	const effectRef = React.useRef(effect);
	const hasRunEffectThisTimeRef = React.useRef(false);

	React.useLayoutEffect(() => {
		// Always keep this up to date.
		effectRef.current = effect;

		if (elementRef.current !== previousElementRef.current) {
			// If we have the cleanup ref set, we are cleaning up. So run it.
			if (cleanupRef.current) {
				cleanupRef.current();
				cleanupRef.current = null;
			}

			previousElementRef.current = elementRef.current;

			// Run effect
			if (elementRef.current) {
				// We have the element - run the effect.
				cleanupRef.current = effectRef.current(elementRef.current);
			}

			hasRunEffectThisTimeRef.current = true;
		}
	});

	React.useLayoutEffect(() => {
		if (!hasRunEffectThisTimeRef.current) {
			if (cleanupRef.current) {
				cleanupRef.current();
				cleanupRef.current = null;
			}
			if (elementRef.current) {
				cleanupRef.current = effectRef.current(elementRef.current);
			}
		}
	}, deps || []);

	React.useLayoutEffect(() => {
		hasRunEffectThisTimeRef.current = false;
	});

	return elementRef;
}

/**
 * Allows an effect-like way to access an element, including cleanup.
 * Runs before any layout effects or regular effects, so it can't take advantage of any changes made by them.
 * Use only when cleanup is needed for an element; otherwise, use a regular ref.
 */
export function useRefEffectCallback<T extends HTMLElement>(effect: RefEffectCallback, deps?: React.DependencyList): React.RefCallback<T> {

	// Our effect function is memoized here, only changing when outside dependencies change.
	const memoizedCallback = React.useCallback(effect, deps || []);

	// This ref does double-duty as the way to tell when we are cleaning up as well as holding that cleanup function.
	const cleanupRef = React.useRef<CleanupRefFunc>(null);

	const callback = React.useCallback((element) => {
		// If we have the cleanup ref set, we are cleaning up. So run it.
		if (cleanupRef.current) {
			cleanupRef.current();
			cleanupRef.current = null;
		}

		if (element) {
			// We have the element - run the effect.
			cleanupRef.current = memoizedCallback(element);
		}
	}, [memoizedCallback]); // Rely on the callback, which in turn relies on our dependencies.

	return callback;
}