import * as React from 'react';

/*
	Simplifies the code to create contexts, because I'm tired of writing it out.
*/

export function createContextConsumer<T>(defaultValue?: any): [React.Provider<T>, () => T] {
	const Context = React.createContext<T>(defaultValue === undefined ? null : defaultValue);
	const consumer = () => React.useContext(Context);
	return [Context.Provider, consumer];
}