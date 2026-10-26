'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useHolidaysDetailHolidayId } from './use-holidays-detail-holiday-id';

/* * */

interface UseHolidaysDetailDataReturnType {
	data: Holiday | null
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<Holiday>>
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

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Holiday>>(holidayId ? API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId) : null, {
		fetcher: async (url: string) => await fetchApiData<Holiday>({ url }),
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? null,
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}
