'use client';

import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Manage the agency filter for the plans list.
 */
export function usePlansListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = usePlansAgenciesData();

	return useFilterStateList('agency', ids, options);
}
