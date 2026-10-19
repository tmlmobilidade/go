'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the roles list filter bar.
 * @returns The filter state management object.
 */
export function useRolesListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
