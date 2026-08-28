'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Manage the agency filter for the validations list.
 */
export function useValidationsListFilterAgency(): UseFilterStateListReturnType {
	const { ids, options } = useAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.gtfs_validations.actions.read],
			scope: PermissionCatalog.all.gtfs_validations.scope,
		},
	});

	return useFilterStateList('agency', ids, options);
}
