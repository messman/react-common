import * as React from 'react';

let globalUniqueIndex = 0;

/** Returns a globally-unique number through an incrementing index. */
export function getUnique(): number {
	return globalUniqueIndex++;
};

/** Returns the same globally-unique number over the life of the component.  */
export function useUnique() {
	const [unique] = React.useState(() => {
		return getUnique();
	});
	return unique;
}