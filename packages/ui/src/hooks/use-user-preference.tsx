'use client';

import { useDebouncedCallback } from '@mantine/hooks';
import { type UserPreferenceValue } from '@tmlmobilidade/types';
import { useEffect, useState } from 'react';

import { useMeContext } from '../contexts/Me.context';

/**
 * A hook to manage user preferences as state.
 * @param scope The scope of the preference.
 * @param key The key of the preference.
 * @param defaultValue The optional default value of the preference.
 * @returns The current preference value and a function to update it.
 */
export function useUserPreference<T extends UserPreferenceValue>(scope: string, key: string, defaultValue: T): [T, (value: T) => void] {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [preferenceValue, setPreferenceValue] = useState<T>();

	//
	// B. Handle actions

	useEffect(() => {
		const value = meContext.actions.getPreference<T>(scope, key);
		setPreferenceValue(value);
	}, [meContext.data.user]);

	const savePreferenceValueDebounced = useDebouncedCallback((value: T) => {
		meContext.actions.updatePreference(scope, key, value);
	}, 500);

	const handleSetPreferenceValue = (value: T) => {
		setPreferenceValue(value);
		savePreferenceValueDebounced(value);
	};

	//
	// C. Render components

	return [preferenceValue ?? defaultValue, handleSetPreferenceValue];

	//
}
