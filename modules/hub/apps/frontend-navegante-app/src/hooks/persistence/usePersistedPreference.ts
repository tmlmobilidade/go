'use client';

import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

/* * */

export function usePersistedPreference<T>(key: string, defaultValue: T, parse: (value: string) => T): [T, Dispatch<SetStateAction<T>>, boolean] {
	const [value, setValue] = useState(defaultValue);
	const [isReady, setIsReady] = useState(false);
	const valueRef = useRef(defaultValue);

	useEffect(() => {
		try {
			const localValue = window.localStorage.getItem(key);
			const previousValue = localValue ?? window.sessionStorage.getItem(key);
			if (previousValue !== null) {
				const restored = parse(previousValue);
				valueRef.current = restored;
				setValue(restored);
				if (localValue === null) window.localStorage.setItem(key, JSON.stringify(restored));
			}
		} catch {
			// Keep the in-memory default if storage is unavailable.
		}
		setIsReady(true);
	}, [key, parse]);

	const setPersistedValue = useCallback<Dispatch<SetStateAction<T>>>((nextValue) => {
		const next = typeof nextValue === 'function' ? (nextValue as (previous: T) => T)(valueRef.current) : nextValue;
		valueRef.current = next;
		setValue(next);
		try {
			window.localStorage.setItem(key, JSON.stringify(next));
		} catch {
			// Keep the new value in memory if storage is unavailable.
		}
	}, [key]);

	return [value, setPersistedValue, isReady];
}
