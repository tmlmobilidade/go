'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useHolidaysAgenciesData } from '../../shared/use-holidays-agencies-data';

/* * */

/** Holidays agencies URL filter. */
export function useHolidaysListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = useHolidaysAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.holidays.actions.read],
			scope: PermissionCatalog.all.holidays.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options);
	return filter;
}
