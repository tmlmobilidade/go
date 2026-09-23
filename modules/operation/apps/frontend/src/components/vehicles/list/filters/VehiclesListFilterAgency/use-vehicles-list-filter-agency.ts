'use client';

import { useVehiclesAgenciesData } from '@/components/vehicles/shared/use-vehicles-agencies-data';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency IDs filter for the vehicles list filter bar.
 */
export function useVehiclesListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useVehiclesAgenciesData();

	return useFilterStateList('agency', ids, options);
}
