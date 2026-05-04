'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { type RoleNormalized } from '@/types/normalized';
import { normalizeString } from '@tmlmobilidade/strings';
import { useQueryState, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface RolesListContextState {
	actions: {
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: RoleNormalized[]
	}
	filters: {
		search: string
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

export const RolesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });

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
		query: filterSearch,
	});

	//
	// C. Define context value

	const contextValue: RolesListContextState = useMemo(() => ({
		actions: {
			setFilterSearch,
		},
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
	}), [
		rolesContext.flags.error,
		rolesContext.flags.loading,
		searchResultsData,
		filterSearch,
	]);

	//
	// D. Render components

	return (
		<RolesListContext.Provider value={contextValue}>
			{children}
		</RolesListContext.Provider>
	);

	//
};
