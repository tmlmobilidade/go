'use client';

import { Dates } from '@tmlmobilidade/dates';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo } from 'react';

/* * */

export interface UseFilterStateDateReturnType {

	/**
	 * Indicates if the filter is currently active.
	 */
	isActive: boolean

	/**
	 * Function to set the filter value.
	 * @param value The new value for the filter.
	 */
	set: (value: null | number) => void

	value_end: number | UnixTimestamp
	/**
	 * The current value of the filter.
	 */
	value_start: number | UnixTimestamp

}

interface UserFilterStateDateOptions {
	minutesOffset?: number
}

export function useFilterStateDate(key: string, options?: UserFilterStateDateOptions) {
	//

	//
	// A. Setup variables

	const defaulTimestamp = useMemo(() => {
		const now = Dates.now('Europe/Lisbon');
		if (options?.minutesOffset) {
			return options.minutesOffset > 0
				? now.plus({ minutes: options.minutesOffset }).unix_timestamp
				: now.minus({ minutes: Math.abs(options.minutesOffset) }).unix_timestamp;
		}
		return now.unix_timestamp;
	}, [options?.minutesOffset]);

	const [urlValueStart, setUrlValueStart] = useQueryState(key + 'start', parseAsInteger.withDefault(defaulTimestamp));
	const [urlValueEnd, setUrlValueEnd] = useQueryState(key + 'end', parseAsInteger.withDefault(defaulTimestamp));

	const handleSetValue = (start: UnixTimestamp, end: UnixTimestamp) => {
		setUrlValueEnd(end);
		setUrlValueStart(start);
	};

	//
	// B. Return data

	return {
		isActive: urlValueEnd !== defaulTimestamp || urlValueStart !== defaulTimestamp,
		set: handleSetValue,
		value_end: urlValueEnd,
		value_start: urlValueStart,
	};

	//
}
