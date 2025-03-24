'use client';

import { swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { Role } from '@tmlmobilidade/core-types';
import { useSearchQuery } from '@tmlmobilidade/ui';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

interface RoleListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
	}
	data: {
		filtered: Role[]
		raw: Role[]
	}
	filters: {
		searchQuery: string
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

const RoleListContext = createContext<RoleListContextState | undefined>(undefined);

export const useRoleListContext = () => {
	const context = useContext(RoleListContext);
	if (!context) {
		throw new Error('useRoleListContext must be used within an RoleListContextProvider');
	}
	return context;
};

export const RoleListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup Variables
	const { data: allRolesData, error: allRolesError, isLoading: allRolesLoading } = useSWR<Role[], Error>(Routes.AUTH_API + Routes.ROLES, swrFetcher);
	const rawRoles = useMemo(() => allRolesData || [], [allRolesData]);

	//
	// B. Transform Data
	const { filteredData: searchFilteredRoles, searchQuery, setSearchQuery } = useSearchQuery(rawRoles, {
		accessors: ['first_name', 'last_name', 'email'],
	});

	const filteredRoles = useMemo(() => {
		return searchFilteredRoles ?? rawRoles;
	}, [searchFilteredRoles, rawRoles]);

	//
	// C. Handle Actions

	//
	// D. Define context value
	const contextValue: RoleListContextState = useMemo(() => ({
		actions: {
			changeSearchQuery: setSearchQuery,
		},
		data: {
			filtered: filteredRoles,
			raw: rawRoles,
		},
		filters: {
			searchQuery: searchQuery ?? '',
		},
		flags: {
			error: allRolesError ?? undefined,
			loading: allRolesLoading,
		},
	}), [allRolesData, allRolesError, allRolesLoading, filteredRoles, rawRoles, searchQuery]);

	//	E. Render Component
	return (
		<RoleListContext.Provider value={contextValue}>
			{children}
		</RoleListContext.Provider>
	);
};
