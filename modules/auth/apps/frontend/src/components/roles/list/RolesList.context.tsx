'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { type RoleNormalized } from '@/types/normalized';
import { normalizeString } from '@tmlmobilidade/strings';
import { useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface RolesListContextState {
	data: {
		filtered: RoleNormalized[]
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

const RolesListContext = createContext<RolesListContextState | undefined>(undefined);

export const useRolesListContext = () => {
	const context = useContext(RolesListContext);
	if (!context) {
		throw new Error('useRolesListContext must be used within an RolesListContextProvider');
	}
	return context;
};

/* * */

export function RolesListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();

	const filterSearch = useFilterStateString('search');

	//
	// B. Transform data

	const normalizedRolesData: RoleNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!rolesContext.data.raw) return [];
		// Normalize record fields
		return rolesContext.data.raw.map(item => ({
			...item,
			name_normalized: normalizeString(item.name),
		}));
	}, [rolesContext.data.raw]);

	const searchResultsData = useSearch<RoleNormalized>({
		accessors: ['name_normalized'],
		data: normalizedRolesData,
		query: filterSearch.value,
	});

	//
	// C. Define context value

	const contextValue: RolesListContextState = {
		data: {
			filtered: searchResultsData,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: rolesContext.flags.error,
			loading: rolesContext.flags.loading,
		},
	};

	//
	// D. Render components

	return (
		<RolesListContext.Provider value={contextValue}>
			{children}
		</RolesListContext.Provider>
	);

	//
};
