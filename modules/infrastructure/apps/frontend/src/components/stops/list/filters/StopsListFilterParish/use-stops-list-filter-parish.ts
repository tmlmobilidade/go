'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsLocationsData } from '../../../shared/use-stops-locations-data';

/**
 * Manage the parish filter for the stops list.
 */
export function useStopsListFilterParish(): UseFilterStateListReturnType {
	//

	const { parishIds, parishOptions } = useStopsLocationsData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	return useFilterStateList('parish', parishIds, parishOptions);
}
