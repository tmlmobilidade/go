'use client';

import { useDebouncedCallback } from '@mantine/hooks';
import { type UserPreferenceValue } from '@tmlmobilidade/types';
import { useEffect, useRef, useState } from 'react';

import { useMeContext } from '../contexts/Me.context';

/* * */

function isEqual(a: unknown, b: unknown) {
	return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * A hook to manage user preferences as state.
 */
export function useUserPreference<T extends UserPreferenceValue>(
	scope: string,
	key: string,
	defaultValue: T,
): [T, (value: T, options?: { save?: boolean }) => void, (value: T) => void] {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [preferenceValue, setPreferenceValue] = useState<T>(defaultValue);

	const hasLocalUpdateRef = useRef(false);
	const latestLocalValueRef = useRef<T>(defaultValue);

	//
	// B. Sync from user data

	useEffect(() => {
		const valueFromUser = meContext.actions.getPreference<T>(scope, key) ?? defaultValue;

		/**
		 * If we just changed this preference locally, do not let an older `/me`
		 * response overwrite the optimistic UI value.
		 */
		if (hasLocalUpdateRef.current) {
			if (isEqual(valueFromUser, latestLocalValueRef.current)) {
				hasLocalUpdateRef.current = false;
			}

			return;
		}

		setPreferenceValue(valueFromUser);
		latestLocalValueRef.current = valueFromUser;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [meContext.data.user, scope, key]);

	//
	// C. Handle actions

	const savePreferenceValueDebounced = useDebouncedCallback((value: T) => {
		meContext.actions.updatePreference(scope, key, value);
	}, 500);

	const savePreferenceValueNow = (value: T) => {
		hasLocalUpdateRef.current = true;
		latestLocalValueRef.current = value;

		savePreferenceValueDebounced.cancel();
		meContext.actions.updatePreference(scope, key, value);
	};

	const handleSetPreferenceValue = (value: T, options?: { save?: boolean }) => {
		hasLocalUpdateRef.current = true;
		latestLocalValueRef.current = value;

		setPreferenceValue(value);

		if (options?.save === false) return;

		savePreferenceValueDebounced(value);
	};

	//
	// D. Return

	return [preferenceValue, handleSetPreferenceValue, savePreferenceValueNow];

	//
}
