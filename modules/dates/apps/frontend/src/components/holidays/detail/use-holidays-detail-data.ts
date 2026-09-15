'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useHolidaysDetailHolidayId } from './use-holidays-detail-holiday-id';

/* * */

interface UseHolidaysDetailDataReturnType {
	data: Holiday | null
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Holiday>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useHolidaysDetailData(): UseHolidaysDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { holidayId } = useHolidaysDetailHolidayId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Holiday>>(API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId), {
		fetcher: async (url: string) => await fetchApiData<Holiday>({ url }),
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? null,
		error: data?.error ?? error?.error ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.error, data?.timestamp, error, isLoading, isValidating, mutate]);
};
