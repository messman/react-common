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

/**
 * Allows an effect-like way to access an element, including cleanup.
 * Use only when cleanup is needed for an element; otherwise, use a regular ref.
 */
export function useRefEffect<T extends HTMLElement>(effect: RefEffectCallback, deps: React.DependencyList): React.RefCallback<T> {

	// Our effect function is memoized here, only changing when outside dependencies change.
	const memoizedCallback = React.useCallback(effect, deps);

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