'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { usePeriodsDetailYearPeriodId } from './use-periods-detail-year-period-id';

/* * */

interface UsePeriodsDetailDataReturnType {
	data: null | YearPeriod
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<YearPeriod>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function usePeriodsDetailData(): UsePeriodsDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { yearPeriodId } = usePeriodsDetailYearPeriodId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<YearPeriod>>(yearPeriodId ? API_ROUTES.offer.YEAR_PERIODS_DETAIL(yearPeriodId) : null, {
		fetcher: async (url: string) => await fetchApiData<YearPeriod>({ url }),
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
