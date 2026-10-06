'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OrganizationsListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

/**
 * Fetches organizations and their agency memberships.
 */
export function useAgenciesOrganizationsData() {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<OrganizationsListItem[]>>(API_ROUTES.core.ORGANIZATIONS_LIST, {
		fetcher: async (url: string) => await fetchApiData<OrganizationsListItem[]>({ url }),
		refreshInterval: 10_000,
	});

	//
	// B. Transform data

	const organizations = useMemo(() => data?.data ?? [], [data?.data]);

	//
	// C. Return data

	return useMemo(() => ({
		data: organizations,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.timestamp, error, isLoading, isValidating, mutate, organizations]);
}
