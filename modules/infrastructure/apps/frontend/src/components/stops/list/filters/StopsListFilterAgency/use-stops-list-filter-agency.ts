'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsAgenciesData } from '../../../shared/use-stops-agencies-data';

/**
 * Manage the agency filter for the stops list.
 */
export function useStopsListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useStopsAgenciesData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	return useFilterStateList('agency', ids, options);
}
