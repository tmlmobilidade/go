'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OrganizationsListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useOrganizationsListFilterSearch } from './OrganizationsListFilterSearch/use-organizations-list-filter-search';

/* * */

interface UseOrganizationsListDataReturnType {
	data: OrganizationsListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function useOrganizationsListData(): UseOrganizationsListDataReturnType {
	//

	//
	// A. Setup variables

	const filterSearch = useOrganizationsListFilterSearch();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<OrganizationsListItem[]>>(API_ROUTES.core.ORGANIZATIONS_LIST, {
		fetcher: async (url: string) => await fetchApiData<OrganizationsListItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<OrganizationsListItem>({
		accessors: ['_id', 'short_name', 'long_name', 'long_name_normalized'],
		data: data?.data,
		query: filterSearch.value,
	});

	//
	// D. Return data

	return useMemo(() => ({
		data: searchResultsData,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [searchResultsData, data?.timestamp, error, isLoading, isValidating, mutate]);
};
