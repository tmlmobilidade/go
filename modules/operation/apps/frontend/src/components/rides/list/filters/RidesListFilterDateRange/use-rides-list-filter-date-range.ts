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
		const now = Dates.now('local');
		const minutesToSubtract = Number(now.toFormat('mm')) % 30;
		return now
			.startOf('minute')
			.minus({ minutes: minutesToSubtract })
			.unix_milliseconds;
	}, []);

	const defaultEndValue = useMemo(() => {
		const now = Dates.now('local');
		const minutesToAdd = Number(now.toFormat('mm')) % 30;
		return now
			.plus({ minutes: 30 - minutesToAdd })
			.unix_milliseconds;
	}, []);

	return useFilterStateDateRange(
		'date_range',
		defaultStartValue,
		defaultEndValue,
	);
}
