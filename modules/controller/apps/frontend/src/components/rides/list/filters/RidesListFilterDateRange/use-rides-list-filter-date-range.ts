'use client';

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useFilterStateDateRange, type UseFilterStateDateRangeReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Hook to manage the date range filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterDateRange(): UseFilterStateDateRangeReturnType {
	//

	const defaultStartValue = useMemo(() => {
		return Dates
			.now('local')
			.minus({ hours: 1 })
			.startOf('hour')
			.unix_timestamp;
	}, []);

	const defaultEndValue = useMemo(() => {
		return Dates
			.now('local')
			.plus({ hours: 1 })
			.endOf('hour')
			.unix_timestamp;
	}, []);

	return useFilterStateDateRange(
		'date_range',
		defaultStartValue,
		defaultEndValue,
	);
}
