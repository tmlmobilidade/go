'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SchoolsListFilters, type SchoolsListItem } from '@tmlmobilidade/go-schools-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useSchoolsListFilterSearch } from '../filters/SchoolsListFilterSearch/use-schools-list-filter-search';

/* * */

interface UseSchoolsListDataReturnType {
	data: SchoolsListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function useSchoolsListData(): UseSchoolsListDataReturnType {
	//

	//
	// A. Setup variables


	const filterSearch = useSchoolsListFilterSearch();

	//
	// B. Transform data

	const query = useMemo<SchoolsListFilters>(() => ({
		search: filterSearch.value,
	}), [filterSearch.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<SchoolsListItem[]>>([API_ROUTES.schools.SCHOOLS_LIST, query], {
		fetcher: async ([url, query]) => await fetchApiData<SchoolsListItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// D. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating, mutate]);
};
