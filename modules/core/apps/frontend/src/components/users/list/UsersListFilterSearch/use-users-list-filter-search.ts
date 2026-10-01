'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the users list filter bar.
 * @returns The filter state management object.
 */
export function useUsersListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
