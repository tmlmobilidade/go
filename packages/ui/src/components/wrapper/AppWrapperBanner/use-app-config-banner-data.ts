'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AppConfigBanner } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAppConfigBannerDataReturnType {
	data: AppConfigBanner
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<AppConfigBanner>) => void
	timestamp: null | UnixTimestamp
}

/* * */

export function useAppConfigBannerData(): UseAppConfigBannerDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<AppConfigBanner>>(API_ROUTES.core.APP_CONFIGS_BANNER, {
		fetcher: (url: string) => fetchApiData<AppConfigBanner>({ url }),
		refreshInterval: 60_000,
	});

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating, mutate]);
};
