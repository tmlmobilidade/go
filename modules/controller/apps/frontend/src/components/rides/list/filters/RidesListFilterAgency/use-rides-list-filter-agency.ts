'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency IDs filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAgency(): UseFilterStateListReturnType {
	//

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.core.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.rides.actions.analysis_read],
		scope: PermissionCatalog.all.rides.scope,
	});

	return useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
}
