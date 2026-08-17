'use client';

import { Dates } from '@tmlmobilidade/dates';
import { useFilterStateDateRange, UseFilterStateDateRangeReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Hook to manage the publish date filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterPublishDate(): UseFilterStateDateRangeReturnType {
	//

	const defaultStartValue = useMemo(() => {
		return Dates
			.now('local')
			.minus({ days: 30 })
			.startOf('day')
			.unix_timestamp;
	}, []);

	const defaultEndValue = useMemo(() => {
		return Dates
			.now('local')
			.plus({ days: 30 })
			.endOf('day')
			.unix_timestamp;
	}, []);

	return useFilterStateDateRange(
		'publish_date',
		defaultStartValue,
		defaultEndValue,
	);
}
