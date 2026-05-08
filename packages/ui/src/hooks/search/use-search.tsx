'use client';

import { useDebouncedValue } from '@mantine/hooks';
import { normalizeString } from '@tmlmobilidade/strings';
import { useMemo } from 'react';

import { accessorSearch } from './acessor-search';
import { plainSearch } from './plain-search';

/* * */

interface UseSearchProps<T> {
	accessors?: (keyof T)[]
	customSearch?: (record: T, query: string) => boolean
	data: T[]
	debounce?: number
	query?: string
}

/* * */

export function useSearch<T>({ accessors, customSearch, data, debounce = 500, query }: UseSearchProps<T>) {
	//

	//
	// A. Setup variables

	const [debouncedQuery] = useDebouncedValue(query, debounce);

	//
	// B. Transform data

	const normalizedQuery = useMemo(() => {
		// Skip if there is no debounced search query
		if (!debouncedQuery) return '';
		// Return the normalized search query
		return normalizeString(debouncedQuery);
	}, [debouncedQuery]);

	const filteredData = useMemo(() => {
		// Skip if there is no data or normalized query
		if (!data || !normalizedQuery?.length) return data;
		// Create a new array from the data and filter it
		return [...data].filter((record) => {
			// Perform a plain search if there are no accessors
			if (!accessors) return plainSearch<T>(record, normalizedQuery);
			// If there are accessors, perform an accessor search
			const accessorMatch = accessors.some(accessor => accessorSearch<T>(record, accessor, normalizedQuery));
			// If there is no custom search function, return the accessor match immediately
			if (!customSearch) return accessorMatch;
			// If there is a custom search function, then run it
			// and return true if either the accessor match or the custom search match is true
			const customMatch = customSearch(record, normalizedQuery);
			return accessorMatch || customMatch;
		});
	}, [data, normalizedQuery, accessors]);

	//
	// C. Render components

	return filteredData;

	//
}
