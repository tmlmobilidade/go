'use client';

import { Dates } from '@tmlmobilidade/dates';
import { useFilterStateDateRange, UseFilterStateDateRangeReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Hook to manage the active period filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterActivePeriod(): UseFilterStateDateRangeReturnType {
	//

	const defaultStartValue = useMemo(() => {
		return Dates
			.now('local')
			.minus({ minutes: 30 })
			.set({ millisecond: 0, second: 0 })
			.unix_timestamp;
	}, []);

	const defaultEndValue = useMemo(() => {
		return Dates
			.now('local')
			.plus({ minutes: 30 })
			.set({ millisecond: 0, second: 0 })
			.unix_timestamp;
	}, []);

	return useFilterStateDateRange(
		'active_period',
		defaultStartValue,
		defaultEndValue,
	);
}
