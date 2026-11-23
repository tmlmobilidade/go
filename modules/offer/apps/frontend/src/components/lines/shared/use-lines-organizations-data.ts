'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OrganizationFilter } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

interface UseLinesOrganizationsDataReturnType {
	data: OrganizationFilter[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<OrganizationFilter[]>>
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

export function useLinesOrganizationsData(): UseLinesOrganizationsDataReturnType {
	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<OrganizationFilter[]>>(API_ROUTES.offer.ORGANIZATIONS_LIST, {
		fetcher: async url => await fetchApiData<OrganizationFilter[]>({ url }),
		refreshInterval: 60_000,
	});

	//
	// B. Transform data

	const organizations = useMemo(() => data?.error || error ? [] : (data?.data ?? [])
		.filter(organization => organization.organization_type && organization.organization_type !== 'agency' && organization.organization_type !== 'other'), [data, error]);
	const ids = useMemo(() => organizations.map(organization => organization._id), [organizations]);
	const options = useMemo(() => organizations.map((organization): SelectDataItem => ({
		label: `${organization.long_name} (${organization.short_name})`,
		value: organization._id,
	})), [organizations]);

	//
	// C. Return data

	return useMemo(() => ({
		data: organizations,
		error: data?.error ?? error?.message ?? null,
		ids,
		isLoading,
		isValidating,
		mutate,
		options,
		timestamp: data?.timestamp ?? null,
	}), [data, error, ids, isLoading, isValidating, mutate, options, organizations]);
}
