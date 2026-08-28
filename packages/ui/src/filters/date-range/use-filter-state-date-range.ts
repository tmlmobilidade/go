'use client';

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
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
	setEnd: (value: null | UnixMilliseconds) => void

	/**
	 * Function to set the start value of the filter.
	 * @param value The new start value for the filter.
	 */
	setStart: (value: null | UnixMilliseconds) => void

	/**
	 * The current end value of the filter.
	 */
	value_end: null | UnixMilliseconds

	/**
	 * The current start value of the filter.
	 */
	value_start: null | UnixMilliseconds

}

export function useFilterStateDateRange(key: string, defaultStart?: null | UnixMilliseconds, defaultEnd?: null | UnixMilliseconds): UseFilterStateDateRangeReturnType {
	//

	//
	// A. Setup variables

	const defaultStartValueSecondsPrecision = useMemo(() => {
		if (!defaultStart) return null;
		return Dates.fromUnixMilliseconds(defaultStart).set({ millisecond: 0 }).unix_milliseconds;
	}, [defaultStart]);

	const defaultEndValueSecondsPrecision = useMemo(() => {
		if (!defaultEnd) return null;
		return Dates.fromUnixMilliseconds(defaultEnd).set({ millisecond: 0 }).unix_milliseconds;
	}, [defaultEnd]);

	const [urlValueStart, setUrlValueStart] = useQueryState(`${key}-start`, parseAsInteger.withDefault(defaultStartValueSecondsPrecision));
	const [urlValueEnd, setUrlValueEnd] = useQueryState(`${key}-end`, parseAsInteger.withDefault(defaultEndValueSecondsPrecision));

	//
	// B. Transform data

	const effectiveValueStart = useMemo(() => {
		if (!urlValueStart) return defaultStart;
		return urlValueStart as UnixMilliseconds;
	}, [urlValueStart, defaultStart]);

	const effectiveValueEnd = useMemo(() => {
		if (!urlValueEnd) return defaultEnd;
		return urlValueEnd as UnixMilliseconds;
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

	return useMemo(() => ({
		isActive,
		setEnd: setUrlValueEnd,
		setStart: setUrlValueStart,
		value_end: effectiveValueEnd,
		value_start: effectiveValueStart,
	}), [isActive, setUrlValueEnd, setUrlValueStart, urlValueEnd, urlValueStart]);
}
