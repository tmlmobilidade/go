'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsLocationsData } from '../../../shared/use-stops-locations-data';

/**
 * Manage the municipality filter for the stops list.
 */
export function useStopsListFilterMunicipality(): UseFilterStateListReturnType {
	//

	const { municipalityIds, municipalityOptions } = useStopsLocationsData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	return useFilterStateList('municipality', municipalityIds, municipalityOptions);
}
