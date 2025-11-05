'use client';

/* * */

import { type UserNormalized } from '@/types/normalized';
import { type User } from '@go/types';
import { normalizeString } from '@go/strings';
import { useSearch } from '@go/ui';
import { usePathname } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsersListContextState {
	actions: {
		setFilterOrganizationIds: (values: string[]) => void
		setFilterRoleIds: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: UserNormalized[]
		raw: User[]
		selectedId: string | undefined
	}
	filters: {
		organization_ids: string[]
		role_ids: string[]
		search: string
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

export const UsersListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const [filterOrganizationIds, setFilterOrganizationIds] = useQueryState('organization_ids', { defaultValue: '', parse: value => value ? value.split(',') : [], serialize: value => value.join(',') });
	const [filterRoleIds, setFilterRoleIds] = useQueryState('role_ids', { defaultValue: '', parse: value => value ? value.split(',') : [], serialize: value => value.join(',') });
	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const pathname = usePathname();

	const selectedId = useMemo(() => {
		const userId = pathname.split('/users/').pop()?.split('?').shift();
		if (!userId) return undefined;
		return decodeURIComponent(userId);
	}, [pathname]);

	//
	// B. Fetch data

	const { data: allUsersData, error: allUsersError, isLoading: allUsersLoading } = useSWR<User[], Error>('/api/users');

	//
	// C. Transform data

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
		accessors: ['first_name_normalized', 'last_name_normalized'],
		data: normalizedUsersData,
		query: filterSearch,
	});

	const roleFilteredData = useMemo(() => {
		// Skip if no role filter is applied
		if (!filterRoleIds.length) return searchResultsData;
		// Filter users by selected roles
		return searchResultsData.filter(user =>
			user.role_ids.some(roleId => filterRoleIds.includes(roleId)),
		);
	}, [searchResultsData, filterRoleIds]);

	const organizationFilteredData = useMemo(() => {
		// Skip if no organization filter is applied
		if (!filterOrganizationIds.length) return roleFilteredData;
		// Filter users by selected organizations
		return roleFilteredData.filter(user =>
			filterOrganizationIds.includes(user.organization_id),
		);
	}, [roleFilteredData, filterOrganizationIds]);

	//
	// D. Define context value

	const contextValue: UsersListContextState = useMemo(() => ({
		actions: {
			setFilterOrganizationIds,
			setFilterRoleIds,
			setFilterSearch,
		},
		data: {
			filtered: organizationFilteredData,
			raw: allUsersData ?? [],
			selectedId,
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
	}), [
		allUsersData,
		allUsersError,
		allUsersLoading,
		organizationFilteredData,
		filterOrganizationIds,
		filterRoleIds,
		filterSearch,
		selectedId,
	]);

	//
	//	E. Render components

	return (
		<UsersListContext.Provider value={contextValue}>
			{children}
		</UsersListContext.Provider>
	);

	//
};
