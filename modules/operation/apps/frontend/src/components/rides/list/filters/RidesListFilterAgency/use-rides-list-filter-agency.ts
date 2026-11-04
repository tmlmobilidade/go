'use client';

import { useRidesAgenciesData } from '@/components/rides/shared/use-rides-agencies-data';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency IDs filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useRidesAgenciesData();

	return useFilterStateList('agency', ids, options);
}
