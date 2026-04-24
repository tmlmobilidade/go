'use client';

/* * */

import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';

import { SelectDataItem } from '../components/inputs/Select';
import { parseAsArrayOfStrings } from '../utils/parse-string-array';

/* * */

export interface UseFilterStateListReturnType<T extends string = string> {
	isActive: boolean
	options: SelectDataItem[]
	set: (value: T[]) => void
	setOptions: (options: SelectDataItem[]) => void
	value: T[]
}

/**
 * Hook to manage filter state with URL synchronization for lists.
 * This is a wrapper around nuqs `useQueryState` to handle
 * setting dynamic default values, preparing options and checking
 * if the filter is active. Use this hook with the `UseFilterStateReturnType`
 * interface to manage filter states in list contexts.
 * @param key The key to use in the URL query string.
 * @param defaults The default value(s) for the filter.
 * @param options Optional list of options for the filter.
 * @returns The filter state management object.
 */
export function useFilterStateList<T extends string>(key: string, defaults: T[], options?: SelectDataItem[]): UseFilterStateListReturnType<T> {
	//

	//
	// A. Setup variables

	const [urlValue, setUrlValue] = useQueryState<string[]>(key, parseAsArrayOfStrings);
	const [listOptions, setListOptions] = useState<SelectDataItem[]>(options ?? []);

	//
	// B. Transform data

	const effectiveValue = useMemo(() => {
		if (!urlValue) return defaults;
		return urlValue as T[];
	}, [urlValue, defaults]);

	const parsedOptions = useMemo(() => {
		// Map options to include checked status
		return listOptions.map(item => ({
			...item,
			checked: effectiveValue.includes(item.value as T),
		}));
	}, [listOptions, effectiveValue]);

	const isActive = useMemo(() => {
		// The filter is not active
		// if the URL value is not set
		if (!urlValue) return false;
		// Quickly check if the arrays are equal
		// by comparing their lengths. This avoids
		// unnecessary computations in most cases.
		if (defaults.length !== urlValue?.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaults.every(item => urlValue.includes(item));
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
		options: parsedOptions,
		set: setUrlValue,
		setOptions: setListOptions,
		value: effectiveValue,
	};

	//
}
