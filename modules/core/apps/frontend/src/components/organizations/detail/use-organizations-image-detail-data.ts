'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useOrganizationsDetailOrganizationId } from './use-organizations-detail-organization-id';

/* * */

interface UseOrganizationsImageDetailDataReturnType {
	data: string
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useOrganizationsImageDetailData(theme: 'dark' | 'light'): UseOrganizationsImageDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { organizationId } = useOrganizationsDetailOrganizationId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<string>>(API_ROUTES.core.ORGANIZATIONS_DETAIL_DETAIL_IMAGE_VAR(organizationId, theme), {
		fetcher: async (url: string) => await fetchApiData<string>({ url }),
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
