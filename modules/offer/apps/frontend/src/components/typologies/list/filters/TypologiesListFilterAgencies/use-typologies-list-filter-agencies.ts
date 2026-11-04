'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useTypologiesAgenciesData } from '../../../shared/use-typologies-agencies-data';

/* * */

/** Typologies agencies URL filter. */
export function useTypologiesListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = useTypologiesAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.typologies.actions.nav],
			scope: PermissionCatalog.all.typologies.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options);
	return filter;
}
