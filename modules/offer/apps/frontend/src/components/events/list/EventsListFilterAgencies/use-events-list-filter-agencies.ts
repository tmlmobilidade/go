'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useEventsAgenciesData } from '../../shared/use-events-agencies-data';

/* * */

interface UseEventsListFilterAgenciesReturnType extends UseFilterStateListReturnType {
	error: null | string
}

/* * */

/** Events agencies URL filter. */
export function useEventsListFilterAgencies(): UseEventsListFilterAgenciesReturnType {
	const { error, ids, isLoading, options } = useEventsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.events.actions.read],
			scope: PermissionCatalog.all.events.scope,
		},
	});
	const filter = useFilterStateList('agency', ids, options, isLoading);
	return useMemo(() => ({ ...filter, error }), [filter, error]);
}
