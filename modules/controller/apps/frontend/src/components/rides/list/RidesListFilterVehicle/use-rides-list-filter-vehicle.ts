'use client';

import { useFilterStateString, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the date range filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterVehicle(): UseFilterStateTextReturnType {
	return useFilterStateString('vehicle');
}
