'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type User } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { fetchMeData } from './fetch-me-data';

/* * */

interface UseMeDataReturnType {
	data: User
	error: null | string
	/** Undefined means authentication has not been established; false means a confirmed 401. */
	isAuthenticated: boolean | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: (data?: ApiResponse<User>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useMeData(): UseMeDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<User>, Error>(API_ROUTES.core.ME_LIST, {
		fetcher: fetchMeData,
		refreshInterval: 60_000, // 1 minute
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: data?.error ?? error?.message ?? null,
		isAuthenticated: data?.status_code === '401' ? false : data?.data ? true : undefined,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating, mutate]);
};
