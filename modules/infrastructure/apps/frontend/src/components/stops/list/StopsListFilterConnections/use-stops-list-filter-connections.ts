'use client';

import { StopConnectionSchema } from '@tmlmobilidade/go-types-infrastructure';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the connections filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterConnections(): UseFilterStateListReturnType {
	return useFilterStateList(
		'connections',
		StopConnectionSchema.options,
		StopConnectionSchema.options.map(item => ({ label: item, value: item })),
	);
}
