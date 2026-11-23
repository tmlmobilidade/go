'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useZonesAgenciesData } from '../../../shared/use-zones-agencies-data';

/* * */

interface UseZonesListFilterAgenciesReturnType extends UseFilterStateListReturnType {
	error: null | string
}

/* * */

/** Zones agencies URL filter. */
export function useZonesListFilterAgencies(): UseZonesListFilterAgenciesReturnType {
	const { error, ids, isLoading, options } = useZonesAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.zones.actions.nav],
			scope: PermissionCatalog.all.zones.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options, isLoading);
	return useMemo(() => ({ ...filter, error }), [filter, error]);
}
