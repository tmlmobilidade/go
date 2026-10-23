'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useEventsAgenciesData } from '../../shared/use-events-agencies-data';

/* * */

/** Events agencies URL filter. */
export function useEventsListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = useEventsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.events.actions.read],
			scope: PermissionCatalog.all.events.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options);
	return filter;
}
