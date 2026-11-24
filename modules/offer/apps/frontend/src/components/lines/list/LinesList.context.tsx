'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { type OrganizationFilter, type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type SelectDataItem, useFilterStateList, type UseFilterStateListReturnType, useFilterStateText, type UseFilterStateTextReturnType, useMeUser, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useLinesOrganizationsData } from '../shared/use-lines-organizations-data';
import { getLinesFilterAgencyIds } from './get-lines-filter-agency-ids';
import { useLinesListData } from './use-lines-list-data';

/* * */

interface LinesListContextState {
	data: {
		agencies: Agency[]
		agencyIds: string[]
		agencyOptions: SelectDataItem[]
		filtered: PopulatedLine[]
		filteredAgencyIds: string[]
		organizations: OrganizationFilter[]
		raw: PopulatedLine[]
	}
	filters: {
		agencies: UseFilterStateListReturnType
		organizations: UseFilterStateListReturnType
		search: UseFilterStateTextReturnType
	}
	flags: {
		agenciesLoading: boolean
		canCreate: boolean
		error: null | string
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

	const { data: me } = useMeUser();
	const { data: agenciesData, ids: agenciesIds, isLoading: agenciesLoading, options: agenciesOptions } = useAgenciesData();
	const { data: organizationsData, error: organizationsError, isLoading: organizationsLoading, options: organizationsOptions } = useLinesOrganizationsData();

	//
	// B. Setup filters

	const filterSearch = useFilterStateText('search');
	const filterOrganizations = useFilterStateList('organization', [], organizationsOptions, organizationsLoading);

	const organizationAgencyIds = useMemo(() => getLinesFilterAgencyIds(agenciesIds, organizationsData, filterOrganizations.value), [agenciesIds, organizationsData, filterOrganizations.value]);
	const organizationAgencyOptions = useMemo(() => {
		const agencyIdsSet = new Set(organizationAgencyIds);
		return agenciesOptions.filter(option => agencyIdsSet.has(option.value));
	}, [agenciesOptions, organizationAgencyIds]);

	const filterAgencies = useFilterStateList('agency', organizationAgencyIds, organizationAgencyOptions);

	//
	// C. Fetch data

	const { data: allLinesData, error: allLinesError, isLoading: allLinesLoading } = useLinesListData();

	//
	// D. Transform data

	const searchResultsData = useSearch<PopulatedLine>({
		accessors: ['_id', 'name', 'code', 'agency_id'],
		data: allLinesData,
		query: filterSearch.value,
	});

	const filteredAgencyIds = useMemo(() => {
		const agencyIdsSet = new Set(organizationAgencyIds);
		return filterAgencies.value.filter(agencyId => agencyIdsSet.has(agencyId));
	}, [filterAgencies.value, organizationAgencyIds]);

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filteredAgencyIds);

		return searchResultsData
			.filter((item: PopulatedLine) => {
				// Filter by agency - check if the line's agency matches the filter
				if (!agencySet.has(item.agency_id)) return false;

				// Return true if all filters pass
				return true;
			})
			.sort((a, b) => {
				return a.code.localeCompare(b.code);
			});
	}, [searchResultsData, filteredAgencyIds]);

	const canCreatePermission = PermissionCatalog.hasPermission(me?.permissions ?? [], PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);

	//
	// E. Define context value

	const contextValue: LinesListContextState = useMemo(() => ({
		data: {
			agencies: agenciesData ?? [],
			agencyIds: agenciesIds,
			agencyOptions: agenciesOptions,
			filtered: filterResultsData,
			filteredAgencyIds,
			organizations: organizationsData,
			raw: allLinesData,
		},
		filters: {
			agencies: filterAgencies,
			organizations: filterOrganizations,
			search: filterSearch,
		},
		flags: {
			agenciesLoading,
			canCreate: canCreatePermission,
			error: allLinesError ?? organizationsError,
			loading: allLinesLoading || organizationsLoading,
		},
	}), [agenciesData, agenciesIds, agenciesLoading, agenciesOptions, filterResultsData, allLinesData, filterAgencies, filterSearch, canCreatePermission, allLinesError, allLinesLoading, filterOrganizations, organizationsError, organizationsLoading, filteredAgencyIds, organizationsData]);

	//
	// F. Render components

	return (
		<LinesListContext.Provider value={contextValue}>
			{children}
		</LinesListContext.Provider>
	);
};
