'use client';

import { swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { User } from '@tmlmobilidade/types';
import { useSearchQuery } from '@tmlmobilidade/ui';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

interface UserListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
	}
	data: {
		filtered: User[]
		raw: User[]
	}
	filters: {
		searchQuery: string
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

const UserListContext = createContext<undefined | UserListContextState>(undefined);

export const useUserListContext = () => {
	const context = useContext(UserListContext);
	if (!context) {
		throw new Error('useUserListContext must be used within an UserListContextProvider');
	}
	return context;
};

export const UserListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup Variables
	const { data: allUsersData, error: allUsersError, isLoading: allUsersLoading } = useSWR<User[], Error>(Routes.AUTH_API + Routes.USERS, swrFetcher);
	const rawUsers = useMemo(() => allUsersData || [], [allUsersData]);

	//
	// B. Transform Data
	const { filteredData: searchFilteredUsers, searchQuery, setSearchQuery } = useSearchQuery(rawUsers, {
		accessors: ['first_name', 'last_name', 'email'],
	});

	const filteredUsers = useMemo(() => {
		return searchFilteredUsers ?? rawUsers;
	}, [searchFilteredUsers, rawUsers]);

	//
	// C. Handle Actions

	//
	// D. Define context value
	const contextValue: UserListContextState = useMemo(() => ({
		actions: {
			changeSearchQuery: setSearchQuery,
		},
		data: {
			filtered: filteredUsers,
			raw: rawUsers,
		},
		filters: {
			searchQuery: searchQuery ?? '',
		},
		flags: {
			error: allUsersError ?? undefined,
			loading: allUsersLoading,
		},
	}), [allUsersData, allUsersError, allUsersLoading, filteredUsers, rawUsers, searchQuery]);

	//	E. Render Component
	return (
		<UserListContext.Provider value={contextValue}>
			{children}
		</UserListContext.Provider>
	);
};
