'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency IDs filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterAgency(): UseFilterStateListReturnType {
	//

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.read],
		scope: PermissionCatalog.all.alerts.scope,
	});

	return useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
}
