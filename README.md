# react-common

_**Not stable. Not recommended for use by anyone other than the creator. I will likely not respond to feature requests.**_

`npm install --save @messman/react-common`

View on [npm](https://www.npmjs.com/package/@messman/react-common) or on [GitHub](https://github.com/messman/react-common).

Common tools for React that I've found myself copy-pasting to different projects, tweaking each time. Better to keep it all in one spot with centralized tracking and testing. Also gives me more practice in writing my own hooks and publishing my own packages.

## Focus

Keep things as generic as possible. Don't rely on any other libraries beyond React and `styled-components`.

## Includes

- Debug tools to track changing props and count renders and log that information
- Small functions for time conversion, copy-to-clipboard, and a globally-unique number
- Helper hooks, like `useLatestForEffect`/`useLatestForLayoutEffect` to always make the latest value of a dependency available for an effect
- Two strategies for providing an effect-like experience for when a DOM element is set/unset (`useRefLayoutEffect` and `useRefEffectCallback`)
- Namespacing, versioning, and migrations for LocalStorage access hooks
- Timers that run correctly even when the web app or tab is minimized or hidden
- Commonly-used UI like `flex` components
- Breakpoint-based window layout responders
- Element resize hooks based on `ResizeObserver`
- Element scroll hooks based on `ResizeObserver`
- Hooks for running promises, which can optionally be added in with the timers mentioned above

## Future Work

Ideas:
- Background blur / [frosted glass](https://webdesign.tutsplus.com/tutorials/how-to-create-a-frosted-glass-effect-in-css--cms-32535)
- Element intersection / lazy load with [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

## Note on Hooks

This library tries to export hooks, and those hooks try to be written using best-practices... however, sometimes I forego the recommended style in order to get something working easily. Copying these hooks is at your own peril.

Good resources on learning about the 'proper' way to use `useEffect` and `useRef` (from what I've learned, `useEffect` should be used as a callback mechanism as sparingly as possible):

- [facebook/react issue #16956: Design decision: why do we need the stale closure problem in the first place?](https://github.com/facebook/react/issues/16956)
- [Dan Abramov: Overreacted: Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
- [Dan Abramov: Overreacted: A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [Comment by Dan Abramov in facebook/react issue #14476: useCallback/useEffect support custom comparator](https://github.com/facebook/react/issues/14476#issuecomment-471199055)
