'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { fetchMeData } from './fetch-me-data';

/* * */

interface UseMePermissionsReturnType {
	data: Permission[] | undefined
	error: null | string
	isAuthenticated: boolean | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: (data?: ApiResponse<Permission[]>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useMePermissions(): UseMePermissionsReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Permission[]>, Error>(API_ROUTES.core.ME_LIST_ME_PERMISSIONS, {
		fetcher: fetchMeData<Permission[]>,
		refreshInterval: 60_000, // 1 minute
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? undefined,
		error: data?.error ?? error?.message ?? null,
		isAuthenticated: data?.status_code === '401' ? false : data?.data ? true : undefined,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating, mutate]);
};
