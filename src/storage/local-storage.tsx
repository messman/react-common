import * as React from 'react';

/** Using a wrapper object allows us to store falsy values. */
export interface LocalStorageItem<T> {
	/** Item */
	x: T;
	/** Version, to clear when we make changes */
	v: string;
}

export interface LocalStorageNamespace {
	keys: () => string[];
	get: typeof get;
	getItem: typeof getItem;
	remove: typeof remove;
	set: <T>(key: string, value: T) => boolean;
	getWithMigration: <T>(key: string, migration: LocalStorageMigration<T>) => T | undefined;
	useLocalStorage: <T>(key: string, migration: LocalStorageMigration<T>) => UseLocalStorageReturn<T>;
}

/** Returns a function that will prefix the key to a namespace to avoid collisions. */
export function createNamespace(namespace: string | null, version: string): LocalStorageNamespace {
	const keyPrefix = namespace ? `${namespace}_` : '';
	function getKey(key: string) {
		return `${keyPrefix}${key}`;
	};

	return {
		keys: function () {
			return keys().filter((key) => {
				return key.startsWith(keyPrefix);
			});
		},
		get: function (key: string) {
			return get(getKey(key));
		},
		getItem: function (key: string) {
			return getItem(getKey(key));
		},
		remove: function (key: string) {
			return remove(getKey(key));
		},
		set: function <T>(key: string, value: T) {
			return set(getKey(key), value, version);
		},
		getWithMigration: function <T>(key: string, migration: LocalStorageMigration<T>) {
			return getWithMigration(getKey(key), migration, version);
		},
		useLocalStorage: function <T>(key: string, migration: LocalStorageMigration<T>) {
			return useLocalStorage(getKey(key), migration, version);
		},
	};
}

/**
 * Gets from LocalStorage. If no value exists, returns undefined.
 * Preserves falsy, empty string, and null.
 */
export function get<T>(key: string): T | undefined {
	try {
		const stringItem = window.localStorage.getItem(key);
		if (stringItem) {
			const item = JSON.parse(stringItem) as LocalStorageItem<T>;
			return item.x;
		}
	} catch (error) {
		console.log(error);
	}
	return undefined;
}

/**
 * Gets from LocalStorage. If no value exists, returns undefined.
 * Preserves falsy, empty string, and null.
 */
export function getItem<T>(key: string): LocalStorageItem<T> | undefined {
	try {
		const stringItem = window.localStorage.getItem(key);
		if (stringItem) {
			return JSON.parse(stringItem) as LocalStorageItem<T>;
		}
	} catch (error) {
		console.log(error);
	}
	return undefined;
}

/** Sets to LocalStorage. */
export function set<T>(key: string, value: T, version: string): boolean {
	if (value === undefined) {
		remove(key);
		return true;
	}
	try {
		const item: LocalStorageItem<T> = {
			x: value,
			v: version
		};
		window.localStorage.setItem(key, JSON.stringify(item));
	} catch (error) {
		console.log(error);
		return false;
	}
	return true;
}

/** Removes from LocalStorage. */
export function remove(key: string): void {
	window.localStorage.removeItem(key);
}

export function change<T>(key: string, oldValue: T | undefined, newValue: T | undefined, version: string): boolean {
	if (Object.is(oldValue, newValue)) {
		return false;
	}
	return set(key, newValue, version);
}


export function keys(): string[] {
	const length = window.localStorage.length;
	const keys: string[] = [];
	for (let i = 0; i < length; i++) {
		keys.push(window.localStorage.key(i)!);
	}
	return keys;
}

export type LocalStorageMigration<T> = (value: T | undefined, item: LocalStorageItem<T> | undefined) => T | undefined;


export function getWithMigration<T>(key: string, migration: LocalStorageMigration<T>, version: string): T | undefined {
	const item = getItem<T>(key);
	const value = item?.x || undefined;
	const newValue = migration(value, item);
	if (!Object.is(value, newValue)) {
		set(key, newValue, version);
	}
	return newValue;
}

export type UseLocalStorageReturn<T> = [T | undefined, (value: T | undefined) => void];

/**
 * Creates a state variable that also saves to LocalStorage.
 * Undefined values are not saved.
 * Initial arguments are frozen for the life of the consuming component.
*/
export function useLocalStorage<T>(key: string, migrationOnGet: LocalStorageMigration<T>, version: string): UseLocalStorageReturn<T> {

	const keyRef = React.useRef(key);
	const versionRef = React.useRef(version);

	const [value, setValue] = React.useState(() => {
		return getWithMigration(key, migrationOnGet, version);
	});

	return React.useMemo<UseLocalStorageReturn<T>>(() => {
		function setNewValue(newValue: T | undefined) {
			if (!Object.is(value, newValue)) {
				set(keyRef.current, newValue, versionRef.current);
				setValue(newValue);
			}
		}
		return [value, setNewValue];
	}, [value]);
}