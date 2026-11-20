'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useFaresAgenciesData } from '../../../shared/use-fares-agencies-data';

/* * */

interface UseFaresListFilterAgenciesReturnType extends UseFilterStateListReturnType {
	error: null | string
}

/* * */

/** Fares agencies URL filter. */
export function useFaresListFilterAgencies(): UseFaresListFilterAgenciesReturnType {
	const { error, ids, isLoading, options } = useFaresAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.fares.actions.nav],
			scope: PermissionCatalog.all.fares.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options, isLoading);
	return useMemo(() => ({ ...filter, error }), [filter, error]);
}
