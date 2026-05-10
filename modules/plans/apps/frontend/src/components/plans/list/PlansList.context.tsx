'use client';

import { type PlanNormalized, planValidityStatusOptions, planValidityStatusValues } from '@/types/normalized';
import { getPlanValidityStatus } from '@/utils/get-plan-validity-status';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { PermissionCatalog, type Plan } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PlansListContextState extends ListContextStateTemplate {
	data: {
		filtered: PlanNormalized[]
		raw: Plan[]
	}
	filters: ListContextStateTemplate['filters'] & {
		agency: UseFilterStateListReturnType
		validity_status: UseFilterStateListReturnType
	}
}

/* * */

const PlansListContext = createContext<PlansListContextState | undefined>(undefined);

export const usePlansListContext = () => {
	const context = useContext(PlansListContext);
	if (!context) {
		throw new Error('usePlansListContext must be used within a PlansListContextProvider');
	}
	return context;
};

/* * */

export const PlansListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allPlansData, error: allPlansError, isLoading: allPlansLoading } = useSWR<Plan[], Error>(API_ROUTES.plans.PLANS_LIST, { refreshInterval: 5_000 });

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.plans.actions.read],
		scope: PermissionCatalog.all.plans.scope,
	});

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
	const filterValidityStatus = useFilterStateList('validity_status', planValidityStatusValues, planValidityStatusOptions);

	//
	// C. Transform data

	const normalizedPlansData: PlanNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allPlansData) return [];
		// Normalize record fields
		return allPlansData.map(item => ({
			...item,
			agency_id_normalized: item.gtfs_agency.agency_id,
			agency_name_normalized: normalizeString(item.gtfs_agency.agency_name),
			validity_status: getPlanValidityStatus(item.gtfs_feed_info.feed_start_date, item.gtfs_feed_info.feed_end_date),
		}));
	}, [allPlansData]);

	const searchResultsData = useSearch<PlanNormalized>({
		accessors: ['_id', 'agency_name_normalized', 'agency_id_normalized'],
		data: normalizedPlansData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency.value);
		const validityStatusSet = new Set(filterValidityStatus.value);
		return searchResultsData
			.filter((item: PlanNormalized) => {
				// Filter by agency
				if (!agencySet.has(item.gtfs_agency.agency_id)) return false;
				// Filter by validity_status
				if (!validityStatusSet.has(item.validity_status)) return false;
				// Return true if all filters pass
				return true;
			})
			.sort((a, b) => {
				return b.gtfs_feed_info.feed_start_date.localeCompare(a.gtfs_feed_info.feed_start_date);
			});
	}, [searchResultsData, filterAgency, filterValidityStatus]);

	//
	// D. Define context value

	const contextValue: PlansListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allPlansData ?? [],
		},
		filters: {
			agency: filterAgency,
			search: filterSearch,
			validity_status: filterValidityStatus,
		},
		flags: {
			error: allPlansError,
			isLoading: allPlansLoading,
		},
	}), [
		allPlansError,
		allPlansLoading,
		filterResultsData,
		filterValidityStatus.value,
		allPlansData,
		filterAgency.value,
		filterSearch.value,
	]);

	//
	// E. Render components

	return (
		<PlansListContext.Provider value={contextValue}>
			{children}
		</PlansListContext.Provider>
	);

	//
};
