'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsLocationsData } from '../../../shared/use-stops-locations-data';

/**
 * Manage the locality filter for the stops list.
 */
export function useStopsListFilterLocality(): UseFilterStateListReturnType {
	//

	const { localityIds, localityOptions } = useStopsLocationsData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	return useFilterStateList('locality', localityIds, localityOptions);
}
