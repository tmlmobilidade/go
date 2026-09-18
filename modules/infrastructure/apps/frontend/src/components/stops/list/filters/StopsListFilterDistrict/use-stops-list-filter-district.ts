'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useStopsLocationsData } from '../../../shared/use-stops-locations-data';

/**
 * Hook to manage the district filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterDistrict(): UseFilterStateListReturnType {
	//

	const { districtIds, districtOptions } = useStopsLocationsData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.read], scope: PermissionCatalog.all.stops.scope },
	});

	return useFilterStateList('district', districtIds, districtOptions);
}
