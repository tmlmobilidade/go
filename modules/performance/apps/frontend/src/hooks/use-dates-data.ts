'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface CalendarEntry {
	date: string // e.g. "20250101"
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes: string
	period: '1' | '2' | '3'
}

export interface UseDatesDataReturnType {
	data: CalendarEntry[] | undefined
	error: null | string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | undefined | UnixMilliseconds
}

/* * */

/**
 * Fetches the calendar entries (day types, holidays and periods) from the performance API.
 */
export function useDatesData(): UseDatesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<CalendarEntry[]>>(API_ROUTES.performance.DATES_LIST, {
		fetcher: async (url: string) => await fetchApiData<CalendarEntry[]>({ url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? undefined,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating, mutate]);
}
