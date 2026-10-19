'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useFilterStateList, UseFilterStateListReturnType, useFilterStateText, type UseFilterStateTextReturnType, useMeContext, useSearch } from '@tmlmobilidade/ui';
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
		search: UseFilterStateTextReturnType
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
	const { ids: agenciesIds, options: agenciesOptions } = useAgenciesData();

	//
	// B. Setup filters

	const filterSearch = useFilterStateText('search');
	const filterAgencies = useFilterStateList('agency', agenciesIds, agenciesOptions);

	//
	// B. Fetch data

	const { data: allZonesData, error: allZonesError, isLoading: allZonesLoading } = useSWR<ApiResponse<Zone[]>>(API_ROUTES.offer.ZONES_LIST, {
		fetcher: async url => await fetchApiData<Zone[]>({ url }),
		refreshInterval: 5000,
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<Zone>({
		accessors: ['_id', 'name', 'code', 'agency_ids'],
		data: allZonesData?.data ?? [],
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
			raw: allZonesData?.data ?? [],
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
