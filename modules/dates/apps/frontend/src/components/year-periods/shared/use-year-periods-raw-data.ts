'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseYearPeriodsRawDataReturnType {
	data: YearPeriod[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch all the year periods the current user can read, without any filter applied.
 * Useful for supplying data to selects and to the calendar assignment.
 * @returns An object containing the year periods, their ids and options.
 */
export function useYearPeriodsRawData(): UseYearPeriodsRawDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<YearPeriod[]>>(API_ROUTES.dates.YEAR_PERIODS_LIST, {
		fetcher: async (url: string) => await fetchApiData<YearPeriod[]>({ url }),
	});

	//
	// B. Transform data

	const rawData = useMemo(() => data?.data ?? [], [data?.data]);

	const idsData = useMemo(() => rawData.map(item => item._id), [rawData]);

	const optionsData = useMemo(() => {
		return rawData.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: item.name,
			value: item._id,
		}));
	}, [rawData]);

	//
	// C. Return value

	return useMemo(() => ({
		data: rawData,
		error: data?.error ?? error?.error ?? null,
		ids: idsData,
		isLoading,
		isValidating,
		mutate,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.error, data?.timestamp, error, idsData, isLoading, isValidating, mutate, optionsData, rawData]);
};
