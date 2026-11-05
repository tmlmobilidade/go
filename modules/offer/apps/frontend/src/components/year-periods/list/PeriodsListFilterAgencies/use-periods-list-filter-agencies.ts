'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { usePeriodsAgenciesData } from '../../shared/use-periods-agencies-data';

/* * */

/** Filter the period list by any of the operators the user can read. */
export function usePeriodsListFilterAgencies(): UseFilterStateListReturnType {
	const { ids, options } = usePeriodsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.year_periods.actions.read],
			scope: PermissionCatalog.all.year_periods.scope,
		},
	});
	return useFilterStateList('agency', ids, options);
}
