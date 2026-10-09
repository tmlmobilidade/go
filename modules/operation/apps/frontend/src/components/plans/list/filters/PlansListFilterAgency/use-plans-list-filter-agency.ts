'use client';

import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { useAgencyFilterOptions, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Manage the agency filter for the plans list.
 */
export function usePlansListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = usePlansAgenciesData();

	const groupedOptions = useAgencyFilterOptions(options);

	return useFilterStateList('agency', ids, groupedOptions);
}
