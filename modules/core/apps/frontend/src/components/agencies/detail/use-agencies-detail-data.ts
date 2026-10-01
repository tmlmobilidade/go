'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAgenciesDetailAgencyId } from './use-agencies-detail-agency-id';

/* * */

interface UseAgenciesDetailDataReturnType {
	data: Agency
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Agency>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAgenciesDetailData(): UseAgenciesDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { agencyId } = useAgenciesDetailAgencyId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Agency>>(API_ROUTES.core.AGENCIES_DETAIL(agencyId), {
		fetcher: async (url: string) => await fetchApiData<Agency>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating, mutate]);
};
