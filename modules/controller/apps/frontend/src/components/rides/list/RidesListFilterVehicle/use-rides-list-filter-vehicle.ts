'use client';

import { useFilterStateTag, type UseFilterStateTagReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the date range filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterVehicle(): UseFilterStateTagReturnType {
	return useFilterStateTag('vehicle');
}
