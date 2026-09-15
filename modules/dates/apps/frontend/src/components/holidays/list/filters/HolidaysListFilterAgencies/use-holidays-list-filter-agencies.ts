'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agencies filter for the holidays list.
 * @returns The filter state management object.
 */
export function useHolidaysListFilterAgencies(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAnnotationsAgenciesData();

	return useFilterStateList('agency', ids, options);
}
