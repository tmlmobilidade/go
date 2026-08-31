'use client';

import { LifecycleStatusValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the lifecycle status filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterLifecycleStatus(): UseFilterStateListReturnType {
	return useFilterStateList(
		'lifecycle_status',
		[...LifecycleStatusValues],
		LifecycleStatusValues.map(item => ({ label: item, value: item })),
	);
}
