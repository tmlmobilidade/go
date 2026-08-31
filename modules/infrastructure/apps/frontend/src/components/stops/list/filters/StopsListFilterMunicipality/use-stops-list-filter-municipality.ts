'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsMunicipalitiesData } from '../../../shared/use-stops-municipalities-data';

/**
 * Manage the municipality filter for the stops list.
 */
export function useStopsListFilterMunicipality(): UseFilterStateListReturnType {
	//

	const { ids, options } = useStopsMunicipalitiesData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	return useFilterStateList('municipality', ids, options);
}
