'use client';

import { StopEquipmentValues } from '@tmlmobilidade/go-types-infrastructure';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the equipment filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterEquipment(): UseFilterStateListReturnType {
	return useFilterStateList(
		'equipment',
		[...StopEquipmentValues],
		StopEquipmentValues.map(item => ({ label: item, value: item })),
	);
}
