'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { HomeQuickLink } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseQuickLinksDataReturnType {
	data: HomeQuickLink[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useQuickLinksData(): UseQuickLinksDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<HomeQuickLink[]>>(API_ROUTES.core.HOME_QUICK_LINKS, {
		fetcher: async (url: string) => await fetchApiData<HomeQuickLink[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error?.error, isLoading, isValidating, mutate]);
};
