'use client';

import { StopFacilityValues } from '@tmlmobilidade/go-types-infrastructure';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the facilities filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterFacilities(): UseFilterStateListReturnType {
	return useFilterStateList(
		'facilities',
		[...StopFacilityValues],
		StopFacilityValues.map(item => ({ label: item, value: item })),
	);
}
