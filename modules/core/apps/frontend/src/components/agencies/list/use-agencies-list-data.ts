'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AgenciesListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAgenciesOrganizationsData } from '../shared/use-agencies-organizations-data';
import { useAgenciesListFilterSearch } from './AgenciesListFilterSearch/use-agencies-list-filter-search';
import { useAgenciesListFilterOrganization } from './filters/AgenciesListFilterOrganization/use-agencies-list-filter-organization';

/* * */

interface UseAgenciesListDataReturnType {
	data: AgenciesListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAgenciesListData(): UseAgenciesListDataReturnType {
	//

	//
	// A. Setup variables

	const filterSearch = useAgenciesListFilterSearch();
	const filterOrganization = useAgenciesListFilterOrganization();
	const { data: organizations } = useAgenciesOrganizationsData();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<AgenciesListItem[]>>(API_ROUTES.core.AGENCIES_LIST, {
		fetcher: async (url: string) => await fetchApiData<AgenciesListItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<AgenciesListItem>({
		accessors: ['_id', 'code', 'name_normalized', 'short_name'],
		data: data?.data,
		query: filterSearch.value,
	});

	const filteredAgenciesData = useMemo(() => {
		if (!filterOrganization.isActive) return searchResultsData;
		const agencyIds = new Set(organizations
			.filter(organization => filterOrganization.value.includes(organization._id))
			.flatMap(organization => organization.agency_ids ?? []));
		return searchResultsData.filter(agency => agencyIds.has(agency._id));
	}, [filterOrganization.isActive, filterOrganization.value, organizations, searchResultsData]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filteredAgenciesData,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [filteredAgenciesData, data?.timestamp, error, isLoading, isValidating, mutate]);
};
