'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { usePeriodsAgenciesData } from '../../shared/use-periods-agencies-data';

/* * */

interface UsePeriodsListFilterAgenciesReturnType extends UseFilterStateListReturnType {
	error: null | string
}

/* * */

/** Filter the period list by any of the operators the user can read. */
export function usePeriodsListFilterAgencies(): UsePeriodsListFilterAgenciesReturnType {
	const { error, ids, isLoading, options } = usePeriodsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.year_periods.actions.read],
			scope: PermissionCatalog.all.year_periods.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options, isLoading);
	return useMemo(() => ({ ...filter, error }), [filter, error]);
}
