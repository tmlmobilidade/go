'use client';

import { useDebouncedCallback } from '@mantine/hooks';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UserPreferenceValue } from '@tmlmobilidade/go-types-core';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { type SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

import { useMeData } from '../auth';
import { fetchApiData } from '../fetch';

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

	const { data: meData } = useMeData();

	const [preferenceValue, setPreferenceValue] = useState<T>(defaultValue);

	const preferenceValueRef = useRef<T>(defaultValue);

	/** Baseline: last local edit time, or last applied server `updated_at`. */
	const latestUpdatedAtRef = useRef<UnixMilliseconds>(0 as UnixMilliseconds);

	//
	// B. Handle actions

	const savePreferenceValueDebounced = useDebouncedCallback((value: T) => {
		const valueFromUserData = meData?.preferences?.[scope]?.[key];
		if (JSON.stringify(value) === JSON.stringify(valueFromUserData)) return;
		fetchApiData({ body: { key, scope, value }, method: 'PUT', url: API_ROUTES.core.PLATFORM_UPDATE_ME_PREFERENCES });
	}, 500);

	useEffect(() => {
		// Get the server's `updated_at`.
		// Skip local sync if not available.
		const serverUpdatedAt = meData?.updated_at;
		if (!serverUpdatedAt) return;
		// Skip local sync unless the server document is strictly newer.
		if (serverUpdatedAt <= latestUpdatedAtRef.current) return;
		// Get the value from the server.
		const valueFromUserData = (meData?.preferences?.[scope]?.[key] as T | undefined) ?? defaultValue;
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
	}, [defaultValue, key, meData?.preferences, meData?.updated_at, savePreferenceValueDebounced, scope]);

	const handleSetPreferenceValue = useCallback((value: SetStateAction<T>, options?: SetUserPreferenceOptions) => {
		// The next value is the current value,
		// or the new value if a function is provided.
		const nextValue = typeof value === 'function'
			? (value as (prev: T) => T)(preferenceValueRef.current)
			: value;
		// Update the latest updated at.
		latestUpdatedAtRef.current = Dates.now('utc').unix_milliseconds;
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
