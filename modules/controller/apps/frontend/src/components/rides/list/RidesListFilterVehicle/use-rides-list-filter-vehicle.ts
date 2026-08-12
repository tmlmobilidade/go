'use client';

import { useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the date range filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterVehicle(): UseFilterStateStringReturnType {
	return useFilterStateString('vehicle');
}
