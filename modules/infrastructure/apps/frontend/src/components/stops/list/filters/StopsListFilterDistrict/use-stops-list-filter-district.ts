'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsLocationsData } from '../../../shared/use-stops-locations-data';

/**
 * Manage the district filter for the stops list.
 */
export function useStopsListFilterDistrict(): UseFilterStateListReturnType {
	//

	const { districtIds, districtOptions } = useStopsLocationsData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	return useFilterStateList('district', districtIds, districtOptions);
}
