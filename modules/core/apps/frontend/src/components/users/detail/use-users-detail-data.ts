'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type User } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useUsersDetailUserId } from './use-users-detail-user-id';

/* * */

interface UseUsersDetailDataReturnType {
	data: User
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<User>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useUsersDetailData(): UseUsersDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { userId } = useUsersDetailUserId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<User>>(API_ROUTES.core.USERS_DETAIL(userId), {
		fetcher: async (url: string) => await fetchApiData<User>({ url }),
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
