'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UsersListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useUsersListFilterSearch } from './UsersListFilterSearch/use-agencies-list-filter-search';

/* * */

interface UseUsersListDataReturnType {
	data: UsersListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function useUsersListData(): UseUsersListDataReturnType {
	//

	//
	// A. Setup variables

	const filterSearch = useUsersListFilterSearch();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<UsersListItem[]>>(API_ROUTES.core.AGENCIES_LIST, {
		fetcher: async (url: string) => await fetchApiData<UsersListItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<UsersListItem>({
		accessors: ['_id', 'code', 'name_normalized', 'short_name'],
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
