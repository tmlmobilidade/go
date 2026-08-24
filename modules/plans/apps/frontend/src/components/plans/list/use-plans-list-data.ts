'use client';

import { type PlanNormalized } from '@/types/normalized';
import { getPlanValidityStatus } from '@/utils/get-plan-validity-status';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { normalizeString } from '@tmlmobilidade/strings';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { usePlansListFilterAgency } from './PlansListFilterAgency/use-plans-list-filter-agency';
import { usePlansListFilterSearch } from './PlansListFilterSearch/use-plans-list-filter-search';
import { usePlansListFilterValidityStatus } from './PlansListFilterValidityStatus/use-plans-list-filter-validity-status';

/* * */

interface UsePlansListDataReturnType {
	data: PlanNormalized[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	raw: Plan[]
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

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Plan[]>>(API_ROUTES.plans.PLANS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Plan[]>({ url }),
		refreshInterval: 5_000,
	});

	//
	// C. Transform data

	const normalizedPlansData = useMemo<PlanNormalized[]>(() => {
		if (!data?.data) return [];

		return data.data.map(item => ({
			...item,
			agency_code_normalized: item.gtfs_agency.agency_id,
			agency_id_normalized: item.agency_id,
			agency_name_normalized: normalizeString(item.gtfs_agency.agency_name),
			validity_status: getPlanValidityStatus(item.gtfs_feed_info.feed_start_date, item.gtfs_feed_info.feed_end_date),
		}));
	}, [data?.data]);

	const searchResultsData = useSearch<PlanNormalized>({
		accessors: ['_id', 'agency_name_normalized', 'agency_id_normalized'],
		data: normalizedPlansData,
		query: filterSearch.value,
	});

	const filteredPlansData = useMemo(() => {
		const agencySet = new Set(filterAgency.value);
		const validityStatusSet = new Set(filterValidityStatus.value);

		return searchResultsData
			.filter(item => agencySet.has(item.agency_id) && validityStatusSet.has(item.validity_status))
			.sort((a, b) => b.gtfs_feed_info.feed_start_date.localeCompare(a.gtfs_feed_info.feed_start_date));
	}, [filterAgency.value, filterValidityStatus.value, searchResultsData]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filteredPlansData,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		mutate,
		raw: data?.data ?? [],
		timestamp: data?.timestamp ?? null,
	}), [data, error, filteredPlansData, isLoading, isValidating, mutate]);
}
