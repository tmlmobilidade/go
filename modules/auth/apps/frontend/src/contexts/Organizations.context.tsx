'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Organization } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface OrganizationsContextState {
	data: {
		raw: Organization[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const OrganizationsContext = createContext<OrganizationsContextState | undefined>(undefined);

export const useOrganizationsContext = () => {
	const context = useContext(OrganizationsContext);
	if (!context) {
		throw new Error('useOrganizationsContext must be used within an OrganizationsContextProvider');
	}
	return context;
};

/* * */

export const OrganizationsContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allOrganizationsData, error: allOrganizationsError, isLoading: allOrganizationsLoading } = useSWR<Organization[], Error>(API_ROUTES.auth.ORGANIZATIONS_LIST);

	//
	// B. Define context value

	const contextValue: OrganizationsContextState = useMemo(() => ({
		data: {
			raw: allOrganizationsData ?? [],
		},
		flags: {
			error: allOrganizationsError,
			loading: allOrganizationsLoading,
		},
	}), [
		allOrganizationsData,
		allOrganizationsError,
		allOrganizationsLoading,
	]);

	//
	// C. Render components

	return (
		<OrganizationsContext.Provider value={contextValue}>
			{children}
		</OrganizationsContext.Provider>
	);

	//
};
