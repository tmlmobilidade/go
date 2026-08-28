'use client';

import { useFilterStateDateRange, type UseFilterStateDateRangeReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the active period filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterActivePeriod(): UseFilterStateDateRangeReturnType {
	return useFilterStateDateRange(
		'active_period',
		undefined,
		undefined,
	);
}
