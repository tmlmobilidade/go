'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useFaresAgenciesData } from '../../../shared/use-fares-agencies-data';

/* * */

/** Fares agencies URL filter. */
export function useFaresListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = useFaresAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.fares.actions.nav],
			scope: PermissionCatalog.all.fares.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options);
	return filter;
}
