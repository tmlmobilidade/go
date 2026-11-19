'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useTypologiesAgenciesData } from '../../../shared/use-typologies-agencies-data';

/* * */

interface UseTypologiesListFilterAgenciesReturnType extends UseFilterStateListReturnType {
	error: null | string
}

/* * */

/** Typologies agencies URL filter. */
export function useTypologiesListFilterAgencies(): UseTypologiesListFilterAgenciesReturnType {
	const { error, ids, isLoading, options } = useTypologiesAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.typologies.actions.nav],
			scope: PermissionCatalog.all.typologies.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options, isLoading);
	return useMemo(() => ({ ...filter, error }), [filter, error]);
}
