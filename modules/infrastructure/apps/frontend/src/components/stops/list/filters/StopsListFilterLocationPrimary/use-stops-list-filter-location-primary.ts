'use client';

import { useStopsLocationsData } from '@/components/stops/shared/use-stops-locations-data';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the Location Primary filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterLocationPrimary(): UseFilterStateListReturnType {
	//

	const { ids, options } = useStopsLocationsData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.read], scope: PermissionCatalog.all.stops.scope },
	});

	return useFilterStateList('location_primary', ids.primary, options.primary);
}
