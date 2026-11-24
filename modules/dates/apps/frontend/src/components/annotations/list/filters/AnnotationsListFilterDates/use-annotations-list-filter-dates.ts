'use client';

import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useFilterStateDateRange } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface UseAnnotationsListFilterDatesReturnType {
	endDate: null | OperationalDateInt
	isActive: boolean
	setEnd: (value: null | OperationalDateInt) => void
	setStart: (value: null | OperationalDateInt) => void
	startDate: null | OperationalDateInt
}

/* * */

/** Occurrence period filter using Operation's URL range state, with day-level inputs. */
export function useAnnotationsListFilterDates(): UseAnnotationsListFilterDatesReturnType {
	//

	//
	// A. Setup variables

	const { isActive, setEnd, setStart, value_end: end, value_start: start } = useFilterStateDateRange('dates', null, null);

	//
	// B. Return state

	return useMemo(() => ({
		endDate: end ? OperationalDateIntSchema.parse(Dates.fromUnixMilliseconds(end).setZone('Europe/Lisbon', 'offset_only').calendar_date) : null,
		isActive,
		setEnd: (value: null | OperationalDateInt) => setEnd(value ? Dates.fromOperationalDateInt(value, 'Europe/Lisbon').unix_milliseconds : null),
		setStart: (value: null | OperationalDateInt) => setStart(value ? Dates.fromOperationalDateInt(value, 'Europe/Lisbon').unix_milliseconds : null),
		startDate: start ? OperationalDateIntSchema.parse(Dates.fromUnixMilliseconds(start).setZone('Europe/Lisbon', 'offset_only').calendar_date) : null,
	}), [end, isActive, setEnd, setStart, start]);
}
