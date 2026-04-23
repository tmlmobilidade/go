'use client';

/* * */

import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useRolesContext } from '@/contexts/Roles.context';
import { type UserNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type User } from '@tmlmobilidade/types';
import { useFilterStateList, UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsersListContextState {
	data: {
		filtered: UserNormalized[]
		raw: User[]
	}
	filters: {
		organization_ids: UseFilterStateListReturnType
		role_ids: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const UsersListContext = createContext<undefined | UsersListContextState>(undefined);

export const useUsersListContext = () => {
	const context = useContext(UsersListContext);
	if (!context) {
		throw new Error('useUsersListContext must be used within an UsersListContextProvider');
	}
	return context;
};

/* * */

export function UsersListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const organizationsContext = useOrganizationsContext();

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterRoleIds = useFilterStateList('role_ids', rolesContext.data.raw.map(item => item._id));
	const filterOrganizationIds = useFilterStateList('organization_ids', organizationsContext.data.raw.map(item => item._id));

	//
	// C. Fetch data

	const { data: allUsersData, error: allUsersError, isLoading: allUsersLoading } = useSWR<User[], Error>(API_ROUTES.auth.USERS_LIST);

	//
	// D. Transform data

	const normalizedUsersData: UserNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allUsersData) return [];
		// Normalize record fields
		return allUsersData
			.map(item => ({
				...item,
				first_name_normalized: normalizeString(item.first_name),
				full_name: `${item.first_name} ${item.last_name}`,
				full_name_normalized: normalizeString(`${item.first_name} ${item.last_name}`),
				last_name_normalized: normalizeString(item.last_name),
			}))
			.sort((a, b) => {
				return a.full_name_normalized.localeCompare(b.full_name_normalized);
			});
	}, [allUsersData]);

	const searchResultsData = useSearch<UserNormalized>({
		accessors: ['first_name_normalized', 'last_name_normalized', 'email', 'full_name_normalized'],
		data: normalizedUsersData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		// const organizationIdsSet = new Set(filterOrganizationIds.value);
		// const roleIdsSet = new Set(filterRoleIds.value);
		return searchResultsData.filter((item: UserNormalized) => {
			// Filter by organization_ids
			if (!filterOrganizationIds.value.includes(item.organization_id)) return false;
			// Filter by role_ids
			if (!filterRoleIds.value.some(roleId => item.role_ids.includes(roleId))) return false;
			// Return true if all filters pass
			return true;
		});
	}, [filterOrganizationIds.value, filterRoleIds.value, searchResultsData]);

	//
	// D. Define context value

	const contextValue: UsersListContextState = {
		data: {
			filtered: filterResultsData,
			raw: allUsersData ?? [],
		},
		filters: {
			organization_ids: filterOrganizationIds,
			role_ids: filterRoleIds,
			search: filterSearch,
		},
		flags: {
			error: allUsersError,
			loading: allUsersLoading,
		},
	};

	//
	//	E. Render components

	return (
		<UsersListContext.Provider value={contextValue}>
			{children}
		</UsersListContext.Provider>
	);

	//
};
