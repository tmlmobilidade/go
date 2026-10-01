'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RolesListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRolesListFilterSearch } from './RolesListFilterSearch/use-roles-list-filter-search';

/* * */

interface UseRolesListDataReturnType {
	data: RolesListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useRolesListData(): UseRolesListDataReturnType {
	//

	//
	// A. Setup variables

	const filterSearch = useRolesListFilterSearch();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<RolesListItem[]>>(API_ROUTES.core.ROLES_LIST, {
		fetcher: async (url: string) => await fetchApiData<RolesListItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<RolesListItem>({
		accessors: ['_id', 'name', 'name_normalized'],
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
