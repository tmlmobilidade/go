'use client';

import { useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';

import { SegmentedControlDataItem } from '../components/inputs/SegmentedControl';

/* * */

export interface UseFilterStateEnumReturnType {
	isActive: boolean
	options: SegmentedControlDataItem[]
	set: (value: string) => void
	value: string
}

/**
 * Hook to manage filter state with URL synchronization for lists.
 * This is a wrapper around nuqs `useQueryState` to handle
 * setting dynamic default values, preparing options and checking
 * if the filter is active. Use this hook with the `UseFilterStateEnumReturnType`
 * interface to manage filter states in list contexts.
 * @param key The key to use in the URL query string.
 * @param defaults The default value(s) for the filter.
 * @param options Optional list of options for the filter.
 * @returns The filter state management object.
 */
export function useFilterStateEnum(key: string, defaults: string, options?: SegmentedControlDataItem[]): UseFilterStateEnumReturnType {
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
		options: options ?? [],
		set: setUrlValue,
		value: effectiveValue,
	};

	//
}
