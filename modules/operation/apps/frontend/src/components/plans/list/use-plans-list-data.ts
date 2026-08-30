'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlansListFilters, type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { usePlansListFilterAgency } from './filters/PlansListFilterAgency/use-plans-list-filter-agency';
import { usePlansListFilterSearch } from './filters/PlansListFilterSearch/use-plans-list-filter-search';
import { usePlansListFilterTemporalStatus } from './filters/PlansListFilterTemporalStatus/use-plans-list-filter-temporal-status';

/* * */

interface UsePlansListDataReturnType {
	data: PlansListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function usePlansListData(): UsePlansListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAgency = usePlansListFilterAgency();
	const filterSearch = usePlansListFilterSearch();
	const filterTemporalStatus = usePlansListFilterTemporalStatus();

	//
	// B. Transform data

	const query = useMemo<PlansListFilters>(() => ({
		agency_ids: filterAgency.value,
		search: filterSearch.value,
		temporal_statuses: filterTemporalStatus.value,
	}), [filterAgency.value, filterSearch.value, filterTemporalStatus.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<PlansListItem[]>>([API_ROUTES.operation.PLANS_LIST, query], {
		fetcher: async ([url, query]) => await fetchApiData<PlansListItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000,
	});

	const searchResultsData = useSearch<PlansListItem>({
		accessors: ['_id'],
		data: data?.data,
		query: filterSearch.value,
	});

	const sortedSearchResultsData = useMemo(() => {
		return [...searchResultsData ?? []].sort((a, b) => b.gtfs_feed_info.feed_start_date - a.gtfs_feed_info.feed_start_date);
	}, [searchResultsData]);

	//
	// D. Return data

	return useMemo(() => ({
		data: sortedSearchResultsData,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [sortedSearchResultsData, data?.timestamp, error, isLoading, isValidating, mutate]);
}
