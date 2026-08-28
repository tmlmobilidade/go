'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Role } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRolesDetailRoleId } from './use-roles-detail-role-id';

/* * */

interface UseRolesDetailDataReturnType {
	data: Role
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Role>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useRolesDetailData(): UseRolesDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { roleId } = useRolesDetailRoleId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Role>>(API_ROUTES.core.ROLES_DETAIL(roleId), {
		fetcher: async (url: string) => await fetchApiData<Role>({ url }),
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
