'use client';

import { filterPermissionResourceValues, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useAgenciesData, useFilterStateList, type UseFilterStateListReturnType, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Hook to manage the agency IDs filter for the vehicles list filter bar.
 */
export function useVehiclesListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAgenciesData();
	const { data: meData } = useMeData();

	const permittedIds = useMemo(() => filterPermissionResourceValues({
		action: PermissionCatalog.all.vehicles.actions.read,
		permissions: meData?.permissions ?? [],
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.vehicles.scope,
		values: ids,
	}), [ids, meData?.permissions]);

	const permittedOptions = useMemo(() => {
		const permittedIdSet = new Set(permittedIds);
		return options.filter(option => permittedIdSet.has(option.value));
	}, [options, permittedIds]);

	return useFilterStateList('agency', permittedIds, permittedOptions);
}
