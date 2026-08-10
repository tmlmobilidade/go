'use client';

import { parseAsBoolean, useQueryState } from 'nuqs';

/* * */

export interface UseFilterStateToggleReturnType {
	isActive: boolean
	set: (value: boolean) => void
	toggle: () => void
	value: boolean
}

/**
 * Hook to manage filter state with URL synchronization for toggles.
 * This is a wrapper around nuqs `useQueryState` to handle
 * setting the toggle value and checking if the filter is active.
 * @param key The key to use in the URL query string.
 * @returns The filter state management object.
 */
export function useFilterStateToggle(key: string): UseFilterStateToggleReturnType {
	//

	//
	// A. Setup variables

	const [urlValue, setUrlValue] = useQueryState<boolean>(key, parseAsBoolean);

	//
	// D. Return data

	return {
		isActive: urlValue === true,
		set: setUrlValue,
		toggle: () => setUrlValue(prev => !prev),
		value: urlValue === true,
	};
}
