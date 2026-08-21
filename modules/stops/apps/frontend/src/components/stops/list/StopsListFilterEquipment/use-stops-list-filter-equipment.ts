'use client';

import { StopEquipmentSchema } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the equipment filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterEquipment(): UseFilterStateListReturnType {
	return useFilterStateList(
		'equipment',
		StopEquipmentSchema.options,
		StopEquipmentSchema.options.map(item => ({ label: item, value: item })),
	);
}
