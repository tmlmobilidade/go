'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency filter for the year periods list.
 * @returns The filter state management object.
 */
export function useYearPeriodsListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAnnotationsAgenciesData();

	return useFilterStateList('agency', ids, options);
}
