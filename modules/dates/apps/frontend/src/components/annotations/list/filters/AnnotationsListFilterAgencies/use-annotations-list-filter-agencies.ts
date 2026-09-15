'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useAnnotationsAgenciesData } from '../../../shared/use-annotations-agencies-data';

/**
 * Hook to manage the agencies filter for the annotations list.
 * @returns The filter state management object.
 */
export function useAnnotationsListFilterAgencies(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAnnotationsAgenciesData();

	return useFilterStateList('agency', ids, options);
}
