'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseHolidaysDataReturnType {
	data: Holiday[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useHolidaysData(): UseHolidaysDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Holiday[]>>(API_ROUTES.dates.HOLIDAYS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Holiday[]>({ url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}
