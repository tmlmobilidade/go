'use client';

/* * */

import { swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { User } from '@tmlmobilidade/types';
import { useSearchQuery } from '@tmlmobilidade/ui';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsersListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
	}
	data: {
		filtered: User[]
		raw: User[]
	}
	filters: {
		search_query: string
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
	// A. Setup Variables

	const { data: allUsersData, error: allUsersError, isLoading: allUsersLoading } = useSWR<User[], Error>(Routes.AUTH_API + Routes.USERS, swrFetcher);
	const rawUsers = useMemo(() => allUsersData || [], [allUsersData]);

	//
	// B. Transform data

	const { filteredData: searchFilteredUsers, searchQuery, setSearchQuery } = useSearchQuery(rawUsers, {
		accessors: ['first_name', 'last_name', 'email'],
	});

	const filteredUsers = useMemo(() => {
		return searchFilteredUsers ?? rawUsers;
	}, [searchFilteredUsers, rawUsers]);

	//
	// D. Define context value

	const contextValue: UsersListContextState = useMemo(() => ({
		actions: {
			changeSearchQuery: setSearchQuery,
		},
		data: {
			filtered: filteredUsers,
			raw: rawUsers,
		},
		filters: {
			search_query: searchQuery ?? '',
		},
		flags: {
			error: allUsersError ?? undefined,
			loading: allUsersLoading,
		},
	}), [allUsersData, allUsersError, allUsersLoading, filteredUsers, rawUsers, searchQuery]);

	//
	//	E. Render components

	return (
		<UsersListContext.Provider value={contextValue}>
			{children}
		</UsersListContext.Provider>
	);

	//
};
