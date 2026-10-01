'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the organizations list filter bar.
 * @returns The filter state management object.
 */
export function useOrganizationsListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
