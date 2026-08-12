'use client';

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { type AgencyNormalized } from '@/types/normalized';
import { normalizeString } from '@tmlmobilidade/strings';
import { useFilterStateText, type UseFilterStateTextReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface AgenciesListContextState {
	data: {
		filtered: AgencyNormalized[]
	}
	filters: {
		search: UseFilterStateTextReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const AgenciesListContext = createContext<AgenciesListContextState | undefined>(undefined);

export const useAgenciesListContext = () => {
	const context = useContext(AgenciesListContext);
	if (!context) {
		throw new Error('useAgenciesListContext must be used within an AgenciesListContextProvider');
	}
	return context;
};

/* * */

export function AgenciesListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	const filterSearch = useFilterStateText('search');

	//
	// B. Transform data

	const normalizedAgenciesData: AgencyNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!agenciesContext.data.raw) return [];
		// Normalize record fields
		return agenciesContext.data.raw
			.map(item => ({ ...item, name_normalized: normalizeString(item.name) }))
			.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
	}, [agenciesContext.data.raw]);

	const searchResultsData = useSearch<AgencyNormalized>({
		accessors: ['_id', 'code', 'name_normalized', 'short_name'],
		data: normalizedAgenciesData,
		query: filterSearch.value,
	});

	//
	// C. Define context value

	const contextValue: AgenciesListContextState = {
		data: {
			filtered: searchResultsData,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: agenciesContext.flags.error,
			loading: agenciesContext.flags.loading,
		},
	};

	//
	// D. Render components

	return (
		<AgenciesListContext.Provider value={contextValue}>
			{children}
		</AgenciesListContext.Provider>
	);

	//
};
