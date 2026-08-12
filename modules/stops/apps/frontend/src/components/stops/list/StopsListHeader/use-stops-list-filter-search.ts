'use client';

import { useFilterStateString, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateString('search');
}
