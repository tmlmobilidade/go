'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { usePeriodsAgenciesData } from '../../shared/use-periods-agencies-data';

/* * */

/** Periods agencies URL filter. */
export function usePeriodsListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = usePeriodsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.year_periods.actions.read],
			scope: PermissionCatalog.all.year_periods.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options);
	return filter;
}
