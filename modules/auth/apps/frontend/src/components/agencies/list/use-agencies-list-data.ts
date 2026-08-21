'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertsListFilters, type AlertsListItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAgenciesListFilterSearch } from './AgenciesListFilterSearch/use-agencies-list-filter-search';

/* * */

interface UseAgenciesListDataReturnType {
	data: AlertsListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function useAgenciesListData(): UseAgenciesListDataReturnType {
	//

	//
	// A. Setup variables

	const filterSearch = useAgenciesListFilterSearch();

	//
	// B. Transform data

	const query = useMemo<AgenciesListFilters>(() => ({
		search: filterSearch.value,
	}), [filterSearch.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<AlertsListItem[]>>([API_ROUTES.alerts.ALERTS_LIST, query], {
		fetcher: async ([url, query]) => await fetchApiData<AlertsListItem[]>({ body: query, method: 'POST', url }),
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
