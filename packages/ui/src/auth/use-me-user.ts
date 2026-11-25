'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type MeUser } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseMeUserReturnType {
	data: MeUser
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (data?: ApiResponse<MeUser>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useMeUser(): UseMeUserReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR(API_ROUTES.core.ME_LIST_ME_USER, {
		fetcher: async (url: string) => await fetchApiData<MeUser>({ url }),
		refreshInterval: 60_000, // 1 minute
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating, mutate]);
};
