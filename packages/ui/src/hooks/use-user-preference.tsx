'use client';

import { useDebouncedCallback } from '@mantine/hooks';
import { type UnixTimestamp, type UserPreferenceValue } from '@tmlmobilidade/types';
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';

import { useMeContext } from '../contexts/Me.context';

/**
 * A hook to manage user preferences as state.
 */
export function useUserPreference<T extends UserPreferenceValue>(scope: string, key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const latestUserUpdatedAt = useRef<null | UnixTimestamp>(null);

	const preferenceValueRef = useRef<T>(defaultValue);
	const [preferenceValue, setPreferenceValue] = useState<T>(defaultValue);

	//
	// B. Handle actions

	useEffect(() => {
		// Skip if the current timestamp
		// is greater than the user updated at
		if (!meContext.data.user?.updated_at) return console.warn('User updated at not available, skipping preference update');
		if (latestUserUpdatedAt.current && latestUserUpdatedAt.current >= meContext.data.user?.updated_at) return console.warn('Latest user updated at is greater than the user updated at, skipping preference update');
		// Otherwise, set the preference from the user data if available
		const valueFromUserData = meContext.data.user?.preferences?.[scope]?.[key] as T | undefined ?? defaultValue;
		setPreferenceValue(valueFromUserData);
		// Update the latest user updated at
		latestUserUpdatedAt.current = meContext.data.user?.updated_at;
	}, [defaultValue, key, meContext.data.user?.preferences, meContext.data.user?.updated_at, scope]);

	// const debouncedSavePreference = useDebouncedCallback((newValue: T) => {
	// 	// Get the value from the user data
	// 	const valueFromUserData = meContext.data.user?.preferences?.[scope]?.[key];
	// 	// If the value is the same, skip
	// 	if (JSON.stringify(newValue) === JSON.stringify(valueFromUserData)) return console.warn('Value is the same, skipping preference update', newValue, valueFromUserData);
	// 	// Otherwise, save the preference
	// 	meContext.actions.updatePreference(scope, key, newValue);
	// }, { delay: 500 });

	useEffect(() => {
		// Run on interval
		const interval = setInterval(() => {
			// Get the value from the user data
			const valueFromUserData = meContext.data.user?.preferences?.[scope]?.[key];
			// If the value is the same, skip
			if (JSON.stringify(preferenceValueRef.current) === JSON.stringify(valueFromUserData)) return console.warn('Value is the same, skipping preference update', preferenceValueRef.current, valueFromUserData);
			// Otherwise, save the preference
			meContext.actions.updatePreference(scope, key, preferenceValueRef.current);
		}, 500);
		return () => clearInterval(interval);
	}, [key, meContext.actions, meContext.data.user?.preferences, scope]);

	useEffect(() => {
		preferenceValueRef.current = preferenceValue;
	}, [preferenceValue]);

	//
	// C. Return values

	return [preferenceValue, setPreferenceValue];

	//
}
