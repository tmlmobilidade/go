'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OrganizationsListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
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

	const ids = useMemo(() => organizations.map(organization => organization._id), [organizations]);
	const options = useMemo(() => organizations.map((organization): SelectDataItem => ({
		label: `${organization.long_name} (${organization.short_name})`,
		value: organization._id,
	})), [organizations]);

	//
	// C. Return data

	return useMemo(() => ({
		data: organizations,
		error: error?.error,
		ids,
		isLoading,
		isValidating,
		mutate,
		options,
		timestamp: data?.timestamp,
	}), [data?.timestamp, error, ids, isLoading, isValidating, mutate, options, organizations]);
}
