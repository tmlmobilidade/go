'use client';

import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateText } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface UseVehiclesListFilterRegistrationDateReturnType {
	isActive: boolean
	setEnd: (value: null | OperationalDateInt) => void
	setStart: (value: null | OperationalDateInt) => void
	value_end: null | OperationalDateInt
	value_start: null | OperationalDateInt
}

/* * */

/**
 * Hook to manage the calendar date range for vehicle registration dates.
 */
export function useVehiclesListFilterRegistrationDate(): UseVehiclesListFilterRegistrationDateReturnType {
	//

	//
	// A. Setup variables

	const filterStart = useFilterStateText('registration_date_start');
	const filterEnd = useFilterStateText('registration_date_end');

	//
	// B. Transform data

	const startResult = OperationalDateIntSchema.safeParse(filterStart.value);
	const endResult = OperationalDateIntSchema.safeParse(filterEnd.value);

	const startDate = startResult.success ? startResult.data : null;
	const endDate = endResult.success ? endResult.data : null;

	//
	// C. Return data

	return useMemo(() => ({
		isActive: startDate !== null || endDate !== null,
		setEnd: (value: null | OperationalDateInt) => filterEnd.set(value === null ? '' : String(value)),
		setStart: (value: null | OperationalDateInt) => filterStart.set(value === null ? '' : String(value)),
		value_end: endDate,
		value_start: startDate,
	}), [endDate, filterEnd.set, filterStart.set, startDate]);
}
