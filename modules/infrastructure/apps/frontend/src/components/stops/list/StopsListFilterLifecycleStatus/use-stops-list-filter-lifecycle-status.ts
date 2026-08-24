'use client';

import { LifecycleStatusSchema } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the lifecycle status filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterLifecycleStatus(): UseFilterStateListReturnType {
	return useFilterStateList(
		'lifecycle_status',
		LifecycleStatusSchema.options,
		LifecycleStatusSchema.options.map(item => ({ label: item, value: item })),
	);
}
