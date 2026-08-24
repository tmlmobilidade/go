'use client';

import { useAgenciesContext, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the agency IDs filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterAgencies(): UseFilterStateListReturnType {
	const agenciesContext = useAgenciesContext();

	return useFilterStateList(
		'agencies',
		agenciesContext.data.raw.map(item => item._id),
		agenciesContext.data.as_options,
	);
}
