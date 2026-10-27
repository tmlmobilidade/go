'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useAnnotationsAgenciesData } from '../../shared/use-annotations-agencies-data';

/* * */

/** Annotations agencies URL filter. */
export function useAnnotationsListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = useAnnotationsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.annotations.actions.read],
			scope: PermissionCatalog.all.annotations.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options);
	return filter;
}
