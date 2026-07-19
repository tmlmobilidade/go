'use client';

import { useDebouncedCallback } from '@mantine/hooks';
import { Dates } from '@tmlmobilidade/dates';
import { type UnixTimestamp, type UserPreferenceValue } from '@tmlmobilidade/types';
import { type SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

import { useMeContext } from '../contexts/Me.context';

/* * */

export interface SetUserPreferenceOptions {
	/** `false` skips persistence; `true` (default) debounces persistence (~500ms). */
	save?: boolean
}

/**
 * A hook to manage user preferences as state.
 * Local edits are never overwritten by refreshed user data unless the
 * server's `updated_at` is strictly more recent than the last local change.
 */
export function useUserPreference<T extends UserPreferenceValue>(scope: string, key: string, defaultValue: T): [T, (value: SetStateAction<T>, options?: SetUserPreferenceOptions) => void] {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [preferenceValue, setPreferenceValue] = useState<T>(defaultValue);
	const preferenceValueRef = useRef<T>(defaultValue);

	/** Baseline: last local edit time, or last applied server `updated_at`. */
	const latestUpdatedAtRef = useRef<UnixTimestamp>(0 as UnixTimestamp);

	//
	// B. Handle actions

	const savePreferenceValueDebounced = useDebouncedCallback((value: T) => {
		const valueFromUserData = meContext.data.user?.preferences?.[scope]?.[key];
		if (JSON.stringify(value) === JSON.stringify(valueFromUserData)) return;
		meContext.actions.updatePreference(scope, key, value);
	}, 500);

	useEffect(() => {
		// Get the server's `updated_at`.
		// Skip local sync if not available.
		const serverUpdatedAt = meContext.data.user?.updated_at;
		if (!serverUpdatedAt) return;
		// Skip local sync unless the server document is strictly newer.
		if (serverUpdatedAt <= latestUpdatedAtRef.current) return;
		// Get the value from the server.
		const valueFromUserData = (meContext.data.user?.preferences?.[scope]?.[key] as T | undefined) ?? defaultValue;
		// Update the latest updated at.
		latestUpdatedAtRef.current = serverUpdatedAt;
		// Cancel the debounced save.
		savePreferenceValueDebounced.cancel();
		// Skip local sync if the value is already up to date.
		if (JSON.stringify(preferenceValueRef.current) === JSON.stringify(valueFromUserData)) return;
		// Update the preference value.
		preferenceValueRef.current = valueFromUserData;
		// Update the local state.
		setPreferenceValue(valueFromUserData);
	}, [defaultValue, key, meContext.data.user?.preferences, meContext.data.user?.updated_at, savePreferenceValueDebounced, scope]);

	const handleSetPreferenceValue = useCallback((value: SetStateAction<T>, options?: SetUserPreferenceOptions) => {
		// The next value is the current value,
		// or the new value if a function is provided.
		const nextValue = typeof value === 'function'
			? (value as (prev: T) => T)(preferenceValueRef.current)
			: value;
		// Update the latest updated at.
		latestUpdatedAtRef.current = Dates.now('utc').unix_timestamp;
		// Update the preference value.
		preferenceValueRef.current = nextValue;
		// Update the local state.
		setPreferenceValue(nextValue);
		// Skip persistence if requested.
		if (options?.save === false) {
			savePreferenceValueDebounced.cancel();
			return;
		}
		// Persist the value.
		savePreferenceValueDebounced(nextValue);
	}, [savePreferenceValueDebounced]);

	//
	// C. Return values

	return [preferenceValue, handleSetPreferenceValue];

	//
}
