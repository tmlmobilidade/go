'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useAlertsAgenciesData } from '../../../shared/use-alerts-agencies-data';

/**
 * Hook to manage the agency IDs filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = useAlertsAgenciesData({
		permissions: {
			actions: ['read'],
			scope: 'alerts',
		},
	});

	return useFilterStateList('agency', ids, options);
}
