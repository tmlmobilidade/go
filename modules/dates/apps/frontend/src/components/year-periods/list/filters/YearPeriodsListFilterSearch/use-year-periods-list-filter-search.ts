'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the yearPeriods list.
 * @returns The filter state management object.
 */
export function useYearPeriodsListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
