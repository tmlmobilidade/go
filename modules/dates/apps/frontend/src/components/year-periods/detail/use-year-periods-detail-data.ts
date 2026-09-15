'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useYearPeriodsDetailYearPeriodId } from './use-year-periods-detail-year-period-id';

/* * */

interface UseYearPeriodsDetailDataReturnType {
	data: null | YearPeriod
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<YearPeriod>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useYearPeriodsDetailData(): UseYearPeriodsDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { yearPeriodId } = useYearPeriodsDetailYearPeriodId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<YearPeriod>>(API_ROUTES.dates.YEAR_PERIODS_DETAIL(yearPeriodId), {
		fetcher: async (url: string) => await fetchApiData<YearPeriod>({ url }),
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
