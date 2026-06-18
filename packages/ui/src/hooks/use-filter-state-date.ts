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

	/**
	 * The current value of the filter.
	 */
	value: number | UnixTimestamp

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

	const [urlValue, setUrlValue] = useQueryState(
		key,
		parseAsInteger.withDefault(defaulTimestamp),
	);

	//
	// B. Return data

	return {
		isActive: urlValue !== defaulTimestamp,
		set: setUrlValue,
		value: urlValue,
	};

	//
}
