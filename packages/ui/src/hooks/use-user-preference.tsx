'use client';

import { useDebouncedState } from '@mantine/hooks';
import { type UserPreferenceValue } from '@tmlmobilidade/types';
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';

import { useMeContext } from '../contexts/Me.context';

/* * */

function isEqual(a: unknown, b: unknown) {
	return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * A hook to manage user preferences as state.
 */
export function useUserPreference<T extends UserPreferenceValue>(scope: string, key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [preferenceValue, setPreferenceValue] = useDebouncedState<T>(defaultValue, 200, { leading: true });

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

	useEffect(() => {
		meContext.actions.updatePreference(scope, key, preferenceValue);
	}, [key, meContext.actions, preferenceValue, scope]);

	//
	// D. Return

	return [preferenceValue, setPreferenceValue];

	//
}
