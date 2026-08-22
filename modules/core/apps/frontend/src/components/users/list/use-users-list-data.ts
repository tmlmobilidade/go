'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UsersListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useUsersListFilterRole } from './UsersListFilterRole/use-users-list-filter-role';
import { useUsersListFilterSearch } from './UsersListFilterSearch/use-users-list-filter-search';

/* * */

interface UseUsersListDataReturnType {
	data: {
		filtered: UsersListItem[]
		raw: UsersListItem[]
	}
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
	const filterRole = useUsersListFilterRole();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<UsersListItem[]>>(API_ROUTES.core.USERS_LIST, {
		fetcher: async (url: string) => await fetchApiData<UsersListItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<UsersListItem>({
		accessors: [
			'_id',
			'email',
			'first_name',
			'last_name',
			'organization_id',
			'role_ids',
			'seen_last_at',
			'first_name_normalized',
			'full_name',
			'full_name_normalized',
			'last_name_normalized',
		],
		data: data?.data,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const organizationIdsSet = new Set(filterOrganizationIds.value);
		const roleIdsSet = new Set(filterRoleIds.value);
		return searchResultsData.filter((item: UserNormalized) => {
			// Filter by organization_ids
			if (item.organization_id && !organizationIdsSet.has(item.organization_id)) return false;
			// Filter by role_ids
			if (item.role_ids.length && !item.role_ids.some(roleId => roleIdsSet.has(roleId))) return false;
			// Return true if all filters pass
			return true;
		});
	}, [filterOrganizationIds.value, filterRole.value, searchResultsData]);

	//
	// D. Return data

	return useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: data?.data ?? [],
		},
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [searchResultsData, data?.timestamp, error, isLoading, isValidating, mutate]);
};
