import * as React from 'react';

interface RenderChangeInfo {
	from: any;
	to: any;
}

// From https://usehooks.com/useWhyDidYouUpdate/
export function useRenderDebug(componentName: string, props: any) {
	const previousProps = React.useRef<any>(null);

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
				console.log('render-debug', componentName, changed);
			}
		}

		previousProps.current = props;
	});
}