'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type LineNormalized } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type SelectDataItem, useFilterStateList, type UseFilterStateListReturnType, useFilterStateText, type UseFilterStateTextReturnType, useMeContext, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesListContextState {
	data: {
		agencies: Agency[]
		agencyIds: string[]
		agencyOptions: SelectDataItem[]
		filtered: LineNormalized[]
		raw: LineNormalized[]
	}
	filters: {
		agencies: UseFilterStateListReturnType
		search: UseFilterStateTextReturnType
	}
	flags: {
		canCreate: boolean
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const LinesListContext = createContext<LinesListContextState | undefined>(undefined);

export const useLinesListContext = () => {
	const context = useContext(LinesListContext);
	if (!context) {
		throw new Error('useLinesListContext must be used within a LinesListContextProvider');
	}
	return context;
};

/* * */

export const LinesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const { data: agenciesData, ids: agenciesIds, options: agenciesOptions } = useAgenciesData();

	//
	// B. Setup filters

	const filterSearch = useFilterStateText('search');
	const filterAgencies = useFilterStateList('agency', agenciesIds, agenciesOptions);

	//
	// B. Fetch data

	const { data: allLinesData, error: allLinesError, isLoading: allLinesLoading } = useSWR<LineNormalized[], Error>(API_ROUTES.offer.LINES_LIST);

	//
	// C. Transform data

	const searchResultsData = useSearch<LineNormalized>({
		accessors: ['_id', 'name', 'code', 'agency_id'],
		data: allLinesData ?? [],
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgencies.value);

		return searchResultsData
			.filter((item: LineNormalized) => {
				// Filter by agency - check if the line's agency matches the filter
				if (!agencySet.has(item.agency_id)) return false;

				// Return true if all filters pass
				return true;
			})
			.sort((a, b) => {
				return a.code.localeCompare(b.code);
			});
	}, [searchResultsData, filterAgencies]);

	const canCreatePermission = meContext.actions.hasPermission(PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);

	// D. Define context value
	const contextValue: LinesListContextState = useMemo(() => ({
		data: {
			agencies: agenciesData ?? [],
			agencyIds: agenciesIds,
			agencyOptions: agenciesOptions,
			filtered: filterResultsData,
			raw: allLinesData ?? [],
		},
		filters: {
			agencies: filterAgencies,
			search: filterSearch,
		},
		flags: {
			canCreate: canCreatePermission,
			error: allLinesError,
			loading: allLinesLoading,
		},
	}), [agenciesData, agenciesIds, agenciesOptions, filterResultsData, allLinesData, filterAgencies, filterSearch, canCreatePermission, allLinesError, allLinesLoading]);

	// E. Render components
	return (
		<LinesListContext.Provider value={contextValue}>
			{children}
		</LinesListContext.Provider>
	);
};
