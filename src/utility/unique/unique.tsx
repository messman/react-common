import * as React from 'react';

let globalUniqueIndex = 0;

export function getUnique(): number {
	return globalUniqueIndex++;
};

export function useUnique() {
	const unique = React.useRef<number>(null!);
	// Usually unsafe because renders could be discarded; but there is no negative consequence to losing this call to getUnique on init.
	if (unique.current === null) {
		unique.current = getUnique();
	}
	return unique.current;
}