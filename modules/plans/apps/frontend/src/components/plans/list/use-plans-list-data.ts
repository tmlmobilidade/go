'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlanListFilters, type PlanListItem } from '@tmlmobilidade/go-plans-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { usePlansListFilterAgency } from './filters/PlansListFilterAgency/use-plans-list-filter-agency';
import { usePlansListFilterSearch } from './filters/PlansListFilterSearch/use-plans-list-filter-search';
import { usePlansListFilterValidityStatus } from './filters/PlansListFilterValidityStatus/use-plans-list-filter-validity-status';
import { usePlansListFilterFeedDates } from './table/PlansListCellFeedDates/use-plans-list-cell-feed-dates';

/* * */

interface UsePlansListDataReturnType {
	data: PlanListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function usePlansListData(): UsePlansListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAgency = usePlansListFilterAgency();
	const filterSearch = usePlansListFilterSearch();
	const filterValidityStatus = usePlansListFilterValidityStatus();
	const filterFeedDates = usePlansListFilterFeedDates();

	//
	// B. Transform data

	const query = useMemo<PlanListFilters>(() => ({
		agency_ids: filterAgency.value,
		search: filterSearch.value,
		validity_statuses: filterValidityStatus.value,
	}), [filterAgency.value, filterFeedDates.value_end, filterFeedDates.value_start, filterSearch.value, filterValidityStatus.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<PlanListItem[]>>([API_ROUTES.plans.PLANS_LIST, query], {
		fetcher: async ([url, query]) => await fetchApiData<PlanListItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000,
	});

	const searchResultsData = useSearch<PlanListItem>({
		accessors: ['_id'],
		data: data?.data,
		query: filterSearch.value,
	});

	const sortedSearchResultsData = useMemo(() => {
		return [...searchResultsData ?? []].sort((a, b) => {
			return b.gtfs_feed_info.feed_start_date.localeCompare(a.gtfs_feed_info.feed_start_date);
		});
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
