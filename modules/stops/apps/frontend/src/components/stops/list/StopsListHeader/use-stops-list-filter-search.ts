'use client';

import { useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterSearch(): UseFilterStateStringReturnType {
	return useFilterStateString('search');
}
