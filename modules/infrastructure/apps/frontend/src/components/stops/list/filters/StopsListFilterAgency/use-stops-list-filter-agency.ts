'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsAgenciesData } from '../../../shared/use-stops-agencies-data';

/**
 * Hook to manage the agency filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useStopsAgenciesData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.read], scope: PermissionCatalog.all.stops.scope },
	});

	return useFilterStateList('agency', ids, options);
}
