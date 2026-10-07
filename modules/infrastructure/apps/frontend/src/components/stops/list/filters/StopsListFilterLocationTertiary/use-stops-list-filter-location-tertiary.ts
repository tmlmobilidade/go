'use client';

import { useStopsLocationsData } from '@/components/stops/shared/use-stops-locations-data';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the Location Tertiary filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterLocationTertiary(): UseFilterStateListReturnType {
	//

	const { ids, options } = useStopsLocationsData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.read], scope: PermissionCatalog.all.stops.scope },
	});

	return useFilterStateList('location_tertiary', ids.tertiary, options.tertiary);
}
