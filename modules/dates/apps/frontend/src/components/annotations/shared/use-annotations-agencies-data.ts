'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AnnotationsAgencyItem } from '@tmlmobilidade/go-dates-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAnnotationsAgenciesDataReturnType {
	error: null | string
	ids: string[]
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch the agencies available for annotations, events, holidays and year periods.
 * Useful for supplying data to filters or select components.
 * @returns An object containing the agencies ids and options.
 */
export function useAnnotationsAgenciesData(): UseAnnotationsAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error } = useSWR<ApiResponse<AnnotationsAgencyItem[]>>(API_ROUTES.dates.ANNOTATIONS_LIST_AGENCIES, {
		fetcher: async (url: string) => await fetchApiData<AnnotationsAgencyItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// B. Transform data

	const idsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Keep only the IDs of the response data
		return data.data.map(item => item._id);
	}, [data?.data]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to SelectDataItem format
		return data.data.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.code} - ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// C. Return value

	return useMemo(() => ({
		error: error?.error,
		ids: idsData,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.timestamp, error?.error, idsData, optionsData]);
};
