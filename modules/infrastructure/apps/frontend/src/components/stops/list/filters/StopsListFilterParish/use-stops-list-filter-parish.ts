'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsLocationsData } from '../../../shared/use-stops-locations-data';

/**
 * Hook to manage the parish filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterParish(): UseFilterStateListReturnType {
	//

	const { parishIds, parishOptions } = useStopsLocationsData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.read], scope: PermissionCatalog.all.stops.scope },
	});

	return useFilterStateList('parish', parishIds, parishOptions);
}
