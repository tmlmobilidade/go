'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the search filter for the vehicles list.
 */
export function useVehiclesListFilterSearch(): UseFilterStateTextReturnType {
	return useFilterStateText('search');
}
