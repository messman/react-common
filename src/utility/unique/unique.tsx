import * as React from 'react';

let globalUniqueIndex = 0;

export function getUnique(): number {
	return globalUniqueIndex++;
};

export function useUnique() {
	const unique = React.useRef<number>(null!);
	if (unique.current === null) {
		unique.current = getUnique();
	}
	return unique.current;
}