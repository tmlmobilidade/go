'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the agencies list filter bar.
 * @returns The filter state management object.
 */
export function useAgenciesListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
