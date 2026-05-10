'use client';

import { useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';

/* * */

export interface UseFilterStateStringReturnType {

	/**
	 * Indicates if the filter is currently active.
	 */
	isActive: boolean

	/**
	 * Function to set the filter value.
	 * @param value The new value for the filter.
	 */
	set: (value: string) => void

	/**
	 * The current value of the filter.
	 */
	value: string

}

/**
 * Hook to manage filter state with URL synchronization for lists.
 * This is a wrapper around nuqs `useQueryState` to handle
 * setting dynamic default values, preparing options and checking
 * if the filter is active. Use this hook with the `UseFilterStateStringReturnType`
 * interface to manage filter states in list contexts.
 * @param key The key to use in the URL query string.
 * @param defaults The default value for the filter. Defaults to an empty string.
 * @returns The filter state management object.
 */
export function useFilterStateString(key: string, defaults = ''): UseFilterStateStringReturnType {
	//

	//
	// A. Setup variables

	const [urlValue, setUrlValue] = useQueryState(key);

	//
	// B. Transform data

	const effectiveValue = useMemo(() => {
		if (!urlValue) return defaults;
		return urlValue;
	}, [urlValue, defaults]);

	const isActive = useMemo(() => {
		// The filter is not active
		// if the URL value is not set
		if (!urlValue) return false;
		// The filter is active if
		// the values are different.
		return urlValue !== defaults;
	}, [urlValue, defaults]);

	//
	// C. Handle actions

	useEffect(() => {
		// Clear URL value if defaults are set
		if (!isActive) setUrlValue(null);
	}, [isActive]);

	//
	// D. Return data

	return {
		isActive,
		set: setUrlValue,
		value: effectiveValue,
	};

	//
}
