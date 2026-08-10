'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency IDs filter for the rides list.
 * @returns The filter state management object.
 */
export function useRidesAgencyFilter(): UseFilterStateListReturnType {
	//

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.rides.actions.analysis_read],
		scope: PermissionCatalog.all.rides.scope,
	});

	return useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
}
