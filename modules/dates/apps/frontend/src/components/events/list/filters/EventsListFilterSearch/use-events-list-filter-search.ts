'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the events list.
 * @returns The filter state management object.
 */
export function useEventsListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
