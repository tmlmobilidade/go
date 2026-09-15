'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agencies filter for the events list.
 * @returns The filter state management object.
 */
export function useEventsListFilterAgencies(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAnnotationsAgenciesData();

	return useFilterStateList('agency', ids, options);
}
