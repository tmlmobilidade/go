'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseEventsDatesDataReturnType {
	error: null | string
	ids: string[]
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch the unique dates used by all events.
 * Useful for supplying data to the dates filter.
 * @returns An object containing the dates ids and options.
 */
export function useEventsDatesData(): UseEventsDatesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error } = useSWR<ApiResponse<Event[]>>(API_ROUTES.dates.EVENTS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Event[]>({ url }),
	});

	//
	// B. Transform data

	const idsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Collect the unique dates of all events
		const uniqueDates = new Set<string>();
		data.data.forEach(item => item.dates.forEach(date => uniqueDates.add(String(date))));
		return Array.from(uniqueDates).sort();
	}, [data?.data]);

	const optionsData = useMemo(() => {
		// Map dates to SelectDataItem format
		return idsData.map((date): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: date,
			value: date,
		}));
	}, [idsData]);

	//
	// C. Return value

	return useMemo(() => ({
		error: error?.error,
		ids: idsData,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.timestamp, error?.error, idsData, optionsData]);
};
