import * as React from 'react';
import { useUnique } from '@/utility/unique/unique';

interface RenderChangeInfo {
	from: any;
	to: any;
}

// From https://usehooks.com/useWhyDidYouUpdate/

/**
 * Stores previously-supplied props dictionary and compares each key-value to report on changes.
 * Logs to the console.
 */
export function useRenderDebug(componentName: string, props: any) {
	const previousProps = React.useRef<any>(null);
	const count = React.useRef(0);

	React.useEffect(() => {
		if (previousProps.current) {
			// Get all keys from previous and current props
			const allKeys = Object.keys({ ...previousProps.current, ...props });
			const changed: { [key: string]: RenderChangeInfo; } = {};
			allKeys.forEach(key => {
				if (previousProps.current[key] !== props[key]) {
					changed[key as keyof typeof changed] = {
						from: previousProps.current[key],
						to: props[key]
					};
				}
			});

			if (Object.keys(changed).length) {
				const counted = ++count.current;
				console.log('render-debug', counted, componentName, changed);
			}
		}

		previousProps.current = props;
	});
}

const windowCountKey = '_counts_';

interface Counts {
	renders: Map<string, number>;
	mounts: Map<string, number>;
}

const counts: Counts = {
	renders: new Map(),
	mounts: new Map()
};

let hasShownMessage = false;
function setup() {
	if (!hasShownMessage) {
		hasShownMessage = true;
		(window as any)[windowCountKey] = counts;
		console.log(`Access render counts at window.${windowCountKey}`);
	}
}

/**
 * Counts the number of times a component with this name is created and rendered.
 * Makes the counts available on the window object (see console log after using).
*/
export function useRenderCount(componentName: string): number {
	setup();

	const id = useUnique();
	const renderKey = `${componentName}-${id}`;
	const count = React.useRef(0);

	React.useEffect(() => {
		count.current++;
		counts.renders.set(renderKey, count.current);
	});

	React.useEffect(() => {
		// New mount
		const mountCount = counts.mounts.get(componentName) || 0;
		counts.mounts.set(componentName, mountCount + 1);

		return () => {
			counts.renders.delete(renderKey);
		};
	}, []);

	return count.current;
}