'use client';

import { UnixTimestamp } from '@tmlmobilidade/types';
import { parseAsInteger, useQueryStates } from 'nuqs';

/* * */

export interface UseFilterStateDateIntervalReturnType {

	/**
	 * Indicates if the filter is currently active.
	 */
	isActive: boolean

	/**
	 * Function to set the filter value.
	 * @param value The new value for the filter.
	 */
	set: (start: UnixTimestamp, end: null | UnixTimestamp) => void
	/**
	 * The current values of the filter.
	 */
	value_end: null | number | UnixTimestamp
	value_start: null | number | UnixTimestamp

}

export function useFilterStateDate(key: string): UseFilterStateDateIntervalReturnType {
	//

	//
	// A. Setup variables
	const [urlStates, setUrlStates] = useQueryStates({
		[key + 'end']: parseAsInteger,
		[key + 'start']: parseAsInteger,
	});

	const urlValueStart = urlStates[key + 'start'];
	const urlValueEnd = urlStates[key + 'end'];

	const handleSetValue = async (start: null | UnixTimestamp, end: null | UnixTimestamp) => {
		const nextValueStart = start !== null ? start : urlValueStart;
		const nextValueEnd = end !== null ? end : urlValueEnd;

		if (nextValueStart === urlValueStart && nextValueEnd === urlValueEnd) {
			return;
		}

		await setUrlStates({
			[key + 'end']: nextValueEnd,
			[key + 'start']: nextValueStart,
		}, { history: 'push', shallow: true });
	};

	//
	// B. Return data

	return {
		isActive: urlValueEnd !== null || urlValueStart !== null,
		set: handleSetValue,
		value_end: urlValueEnd,
		value_start: urlValueStart,
	};

	//
}
