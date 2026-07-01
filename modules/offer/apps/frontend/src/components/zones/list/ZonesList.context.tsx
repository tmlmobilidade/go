'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type Zone } from '@tmlmobilidade/types';
import { useDataAgenciesNew, useFilterStateList, UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useMeContext, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ZonesListContextState {
	data: {
		filtered: Zone[]
		raw: Zone[]
	}
	filters: {
		agencies: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
	}
	flags: {
		canCreate: boolean
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const ZonesListContext = createContext<undefined | ZonesListContextState>(undefined);

export const useZonesListContext = () => {
	const context = useContext(ZonesListContext);
	if (!context) {
		throw new Error('useZonesListContext must be used within a ZonesListContextProvider');
	}
	return context;
};

/* * */

export const ZonesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const { agencyIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgenciesNew(API_ROUTES.offer.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.zones.actions.nav],
		scope: PermissionCatalog.all.zones.scope,
	});

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgencies = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	//
	// B. Fetch data

	const { data: allZonesData, error: allZonesError, isLoading: allZonesLoading } = useSWR<Zone[], Error>(API_ROUTES.offer.ZONES_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const searchResultsData = useSearch<Zone>({
		accessors: ['_id', 'name', 'code', 'agency_ids'],
		data: allZonesData ?? [],
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		if (!searchResultsData) return [];
		const agencySet = new Set(filterAgencies.value);
		return searchResultsData
			.filter((item: Zone) => {
				if (!item.agency_ids.some(agencyId => agencySet.has(agencyId))) return false;
				return true;
			})
			.sort((a, b) => {
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [searchResultsData, filterAgencies]);

	const canCreatePermission = meContext.actions.hasPermission(PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.create);

	// D. Define context value
	const contextValue: ZonesListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allZonesData ?? [],
		},
		filters: {
			agencies: filterAgencies,
			search: filterSearch,
		},
		flags: {
			canCreate: canCreatePermission,
			error: allZonesError,
			loading: allZonesLoading,
		},
	}), [allZonesError, allZonesLoading, allZonesData, canCreatePermission, filterResultsData, filterSearch, filterAgencies]);

	return (
		<ZonesListContext.Provider value={contextValue}>
			{children}
		</ZonesListContext.Provider>
	);
};
