'use client';

import { Dates } from '@tmlmobilidade/dates';
import { useFilterStateDateRange, UseFilterStateDateRangeReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Hook to manage the date range filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterDateRange(): UseFilterStateDateRangeReturnType {
	//

	const defaultStartValue = useMemo(() => {
		return Dates.now('local').minus({ minutes: 30 }).unix_timestamp;
	}, []);

	const defaultEndValue = useMemo(() => {
		return Dates.now('local').plus({ minutes: 30 }).unix_timestamp;
	}, []);

	return useFilterStateDateRange(
		'date_range',
		defaultStartValue,
		defaultEndValue,
	);
}
