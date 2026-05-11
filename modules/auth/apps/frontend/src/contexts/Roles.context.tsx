'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Role } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RolesContextState {
	data: {
		raw: Role[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const RolesContext = createContext<RolesContextState | undefined>(undefined);

export const useRolesContext = () => {
	const context = useContext(RolesContext);
	if (!context) {
		throw new Error('useRolesContext must be used within an RolesContextProvider');
	}
	return context;
};

/* * */

export const RolesContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allRolesData, error: allRolesError, isLoading: allRolesLoading } = useSWR<Role[], Error>(API_ROUTES.auth.ROLES_LIST);

	//
	// B. Define context value

	const contextValue: RolesContextState = useMemo(() => ({
		data: {
			raw: allRolesData ?? [],
		},
		flags: {
			error: allRolesError,
			loading: allRolesLoading,
		},
	}), [
		allRolesData,
		allRolesError,
		allRolesLoading,
	]);

	//
	// C. Render components

	return (
		<RolesContext.Provider value={contextValue}>
			{children}
		</RolesContext.Provider>
	);

	//
};
