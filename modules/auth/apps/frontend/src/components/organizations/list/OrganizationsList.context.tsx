'use client';

import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { type OrganizationNormalized } from '@/types/normalized';
import { normalizeString } from '@tmlmobilidade/strings';
import { useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface OrganizationsListContextState {
	data: {
		filtered: OrganizationNormalized[]
	}
	filters: {
		search: UseFilterStateStringReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const OrganizationsListContext = createContext<OrganizationsListContextState | undefined>(undefined);

export const useOrganizationsListContext = () => {
	const context = useContext(OrganizationsListContext);
	if (!context) {
		throw new Error('useOrganizationsListContext must be used within an OrganizationsListContextProvider');
	}
	return context;
};

/* * */

export function OrganizationsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const organizationsContext = useOrganizationsContext();

	const filterSearch = useFilterStateString('search');

	//
	// B. Transform data

	const normalizedOrganizationsData: OrganizationNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!organizationsContext.data.raw) return [];
		// Normalize record fields
		return organizationsContext.data.raw
			.map(item => ({ ...item, long_name_normalized: normalizeString(item.long_name) }))
			.sort((a, b) => a._id.localeCompare(b._id, undefined, { numeric: true }));
	}, [organizationsContext.data.raw]);

	const searchResultsData = useSearch<OrganizationNormalized>({
		accessors: ['long_name_normalized'],
		data: normalizedOrganizationsData,
		query: filterSearch.value,
	});

	//
	// C. Define context value

	const contextValue: OrganizationsListContextState = {
		data: {
			filtered: searchResultsData,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: organizationsContext.flags.error,
			loading: organizationsContext.flags.loading,
		},
	};

	//
	// D. Render components

	return (
		<OrganizationsListContext.Provider value={contextValue}>
			{children}
		</OrganizationsListContext.Provider>
	);

	//
};
