'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useAgenciesData, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Manage the agency filter for the plans list.
 */
export function usePlansListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.plans.actions.read],
			scope: PermissionCatalog.all.plans.scope,
		},
	});

	return useFilterStateList('agency', ids, options);
}
