'use client';

import { useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterSearch(): UseFilterStateStringReturnType {
	return useFilterStateString('search');
}
