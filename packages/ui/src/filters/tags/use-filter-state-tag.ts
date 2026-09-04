'use client';

import { useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { parseAsArrayOfStrings } from '../../utils';

/* * */

export interface UseFilterStateTagReturnType {
	isActive: boolean
	options: string[]
	set: (value: string[]) => void
	value: string[]
}

/**
 * Hook to manage filter state with URL synchronization for tags.
 * This is a wrapper around nuqs `useQueryState` to handle
 * setting dynamic default values. Use this hook with the
 * `UseFilterStateTagReturnType` interface to manage filter states
 * in tag contexts.
 * @param key The key to use in the URL query string.
 * @param options Optional list of options for the filter.
 * @returns The filter state management object.
 */
export function useFilterStateTag(key: string, options?: string[]): UseFilterStateTagReturnType {
	//

	//
	// A. Setup variables

	const [urlValue, setUrlValue] = useQueryState<string[]>(key, parseAsArrayOfStrings);

	//
	// B. Handle actions

	const handleSetUrlValue = (value: string[]) => {
		if (!value.length) setUrlValue(null);
		else setUrlValue(value);
	};

	//
	// C. Return data

	return useMemo(() => ({
		isActive: !!urlValue,
		options: options || [],
		set: handleSetUrlValue,
		value: urlValue || [],
	}), [urlValue, options]);
}
