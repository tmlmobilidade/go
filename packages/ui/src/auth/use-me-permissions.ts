'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseMePermissionsReturnType {
	data: Permission[]
	error: null | string
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

	const { data, error, isLoading, isValidating, mutate } = useSWR(API_ROUTES.core.ME_LIST_ME_PERMISSIONS, {
		fetcher: async (url: string) => await fetchApiData<Permission[]>({ url }),
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
