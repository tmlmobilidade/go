'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useZonesAgenciesData } from '../../../shared/use-zones-agencies-data';

/* * */

/** Zones agencies URL filter. */
export function useZonesListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = useZonesAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.zones.actions.nav],
			scope: PermissionCatalog.all.zones.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options);
	return filter;
}
