'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useOrganizationsDetailOrganizationId } from './use-organizations-detail-organization-id';

/* * */

interface UseOrganizationsDetailDataReturnType {
	data: Organization
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Organization>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useOrganizationsDetailData(): UseOrganizationsDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { organizationId } = useOrganizationsDetailOrganizationId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Organization>>(API_ROUTES.core.ORGANIZATIONS_DETAIL_DETAIL(organizationId), {
		fetcher: async (url: string) => await fetchApiData<Organization>({ url }),
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
