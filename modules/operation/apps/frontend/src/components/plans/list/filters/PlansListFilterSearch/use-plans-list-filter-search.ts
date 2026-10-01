'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Manage the search filter for the plans list.
 */
export function usePlansListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
