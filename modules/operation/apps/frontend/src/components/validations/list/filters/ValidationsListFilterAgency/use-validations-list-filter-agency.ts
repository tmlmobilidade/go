'use client';

import { useAgencyFilterOptions, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useGtfsValidationsAgenciesData } from '../../../shared/use-gtfs-validations-agencies-data';

/**
 * Manage the agency filter for the validations list.
 */
export function useValidationsListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useGtfsValidationsAgenciesData({
		permissions: { actions: ['read'], scope: 'gtfs_validations' },
	});

	const groupedOptions = useAgencyFilterOptions(options);

	return useFilterStateList('agency', ids, groupedOptions);
}
