'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Line } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseEventsLinesDataReturnType {
	data: Line[]
	error: null | string
	ids: string[]
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch all the lines, sorted by code.
 * Useful for supplying data to the event rules selects.
 * @returns An object containing the lines, their ids and options.
 */
export function useEventsLinesData(): UseEventsLinesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error } = useSWR<ApiResponse<Line[]>>(API_ROUTES.offer.LINES_LIST, {
		fetcher: async (url: string) => await fetchApiData<Line[]>({ url }),
	});

	//
	// B. Transform data

	const sortedData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Sort the lines by code
		return [...data.data].sort((a, b) => a.code.localeCompare(b.code));
	}, [data?.data]);

	const idsData = useMemo(() => sortedData.map(item => item._id), [sortedData]);

	const optionsData = useMemo(() => {
		return sortedData.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `${item.code} - ${item.name}`,
			value: item._id,
		}));
	}, [sortedData]);

	//
	// C. Return value

	return useMemo(() => ({
		data: sortedData,
		error: data?.error ?? error?.error ?? null,
		ids: idsData,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.error, data?.timestamp, error, idsData, optionsData, sortedData]);
};
