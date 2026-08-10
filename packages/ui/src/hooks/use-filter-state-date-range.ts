'use client';

import { UnixTimestamp } from '@tmlmobilidade/types';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';

/* * */

export interface UseFilterStateDateRangeReturnType {

	/**
	 * Indicates if the filter is currently active.
	 */
	isActive: boolean

	/**
	 * Function to set the end value of the filter.
	 * @param value The new end value for the filter.
	 */
	setEnd: (value: null | UnixTimestamp) => void

	/**
	 * Function to set the start value of the filter.
	 * @param value The new start value for the filter.
	 */
	setStart: (value: null | UnixTimestamp) => void

	/**
	 * The current end value of the filter.
	 */
	value_end: null | UnixTimestamp

	/**
	 * The current start value of the filter.
	 */
	value_start: null | UnixTimestamp

}

export function useFilterStateDateRange(key: string, defaultStart?: null | UnixTimestamp, defaultEnd?: null | UnixTimestamp): UseFilterStateDateRangeReturnType {
	//

	//
	// A. Setup variables

	const [urlValueStart, setUrlValueStart] = useQueryState(`${key}-start`, parseAsInteger);
	const [urlValueEnd, setUrlValueEnd] = useQueryState(`${key}-end`, parseAsInteger);

	//
	// B. Transform data

	const effectiveValueStart = useMemo(() => {
		if (!urlValueStart) return defaultStart;
		return urlValueStart as UnixTimestamp;
	}, [urlValueStart, defaultStart]);

	const effectiveValueEnd = useMemo(() => {
		if (!urlValueEnd) return defaultEnd;
		return urlValueEnd as UnixTimestamp;
	}, [urlValueEnd, defaultEnd]);

	const isActive = useMemo(() => {
		// The filter is active only if the start or end values
		// are set and are different from the default values.
		const isActiveStart = !!urlValueStart && urlValueStart !== defaultStart;
		const isActiveEnd = !!urlValueEnd && urlValueEnd !== defaultEnd;
		return isActiveStart || isActiveEnd;
	}, [urlValueStart, defaultStart, urlValueEnd, defaultEnd]);

	//
	// C. Handle actions

	useEffect(() => {
		// Clear URL values if the filter is not active
		if (!isActive) setUrlValueStart(null);
		if (!isActive) setUrlValueEnd(null);
	}, [isActive]);

	//
	// D. Return data

	return {
		isActive,
		setEnd: setUrlValueEnd,
		setStart: setUrlValueStart,
		value_end: effectiveValueEnd,
		value_start: effectiveValueStart,
	};
}
