'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useAgenciesData, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency IDs filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAgenciesData({
		actions: [PermissionCatalog.all.alerts.actions.read],
		scope: PermissionCatalog.all.alerts.scope,
	});

	return useFilterStateList('agency', ids, options);
}
