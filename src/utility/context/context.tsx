import * as React from 'react';

const no_context = { _noContext: true };
/**
 * Creates a context provider and matching consumer.
 */
export function createContextConsumer<T>(defaultValue?: any): [React.Provider<T>, () => T] {
	const Context = React.createContext<T>(defaultValue === undefined ? no_context : defaultValue);
	const consumer = () => {
		const context = React.useContext(Context);
		if (context as unknown as any === no_context) {
			console.warn('Context called without value or default value from provider');
			return null!;
		}
		return context;
	};
	return [Context.Provider, consumer];
}