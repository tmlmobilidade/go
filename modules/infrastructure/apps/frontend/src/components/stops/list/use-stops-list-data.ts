'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsListFilters, type StopsListItem } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

// import { useStopsListFilterActivePeriod } from './filters/StopsListFilterActivePeriod/use-stops-list-filter-active-period';
// import { useStopsListFilterAgency } from './filters/StopsListFilterAgency/use-stops-list-filter-agency';
// import { useStopsListFilterCause } from './filters/StopsListFilterCause/use-stops-list-filter-cause';
// import { useStopsListFilterEffect } from './filters/StopsListFilterEffect/use-stops-list-filter-effect';
// import { useStopsListFilterPublishDate } from './filters/StopsListFilterPublishDate/use-stops-list-filter-publish-date';
// import { useStopsListFilterPublishStatus } from './filters/StopsListFilterPublishStatus/use-stops-list-filter-publish-status';
// import { useStopsListFilterReferenceType } from './filters/StopsListFilterReferenceType/use-stops-list-filter-reference-type';
import { useStopsListFilterSearch } from './filters/StopsListFilterSearch/use-stops-list-filter-search';

/* * */

interface UseStopsListDataReturnType {
	data: StopsListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useStopsListData(): UseStopsListDataReturnType {
	//

	//
	// A. Setup variables

	// const filterAgency = useStopsListFilterAgency();
	// const filterReferenceType = useStopsListFilterReferenceType();
	// const filterPublishDate = useStopsListFilterPublishDate();
	// const filterPublishStatus = useStopsListFilterPublishStatus();
	// const filterActivePeriod = useStopsListFilterActivePeriod();
	// const filterCause = useStopsListFilterCause();
	// const filterEffect = useStopsListFilterEffect();
	const filterSearch = useStopsListFilterSearch();

	//
	// B. Transform data

	// const query = useMemo<StopsListFilters>(() => ({
	// 	active_period_end: filterActivePeriod.value_end,
	// 	active_period_start: filterActivePeriod.value_start,
	// 	agency_ids: filterAgency.value,
	// 	causes: filterCause.value,
	// 	effects: filterEffect.value,
	// 	publish_date_end: filterPublishDate.value_end,
	// 	publish_date_start: filterPublishDate.value_start,
	// 	publish_status: filterPublishStatus.value,
	// 	reference_type: filterReferenceType.value,
	// }), [filterAgency.value, filterPublishStatus.value, filterReferenceType.value, filterCause.value, filterEffect.value, filterActivePeriod.value_end, filterActivePeriod.value_start, filterPublishDate.value_end, filterPublishDate.value_start]);

	const query = useMemo<StopsListFilters>(() => ({
		agency_ids: [],
		district_ids: [],
		lifecycle_statuses: [],
		locality_ids: [],
		municipality_ids: [],
		parish_ids: [],
		search: filterSearch.value,
	}), [filterSearch.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<StopsListItem[]>>([API_ROUTES.operation.ALERTS_LIST, query], {
		fetcher: async ([url, query]) => await fetchApiData<StopsListItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// D. Transform data

	const searchResultsData = useSearch<StopsListItem>({
		accessors: ['_id', 'name'],
		data: data?.data,
		query: filterSearch.value,
	});

	//
	// E. Return data

	return useMemo(() => ({
		data: searchResultsData,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [searchResultsData, data?.timestamp, error, isLoading, isValidating, mutate]);
};
