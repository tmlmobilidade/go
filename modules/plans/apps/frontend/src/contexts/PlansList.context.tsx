'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { type PlanNormalized, planValidityStatusValues } from '@/types/normalized';
import { getPlanValidityStatus } from '@/utils/get-plan-validity-status';
import { type Plan } from '@go/types';
import { useSearch } from '@go/ui';
import { normalizeString } from '@go/utils';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PlansListContextState {
	actions: {
		setFilterAgency: (values: string[]) => void
		setFilterSearch: (values: string) => void
		setFilterValidityStatus: (values: string[]) => void
	}
	data: {
		filtered: PlanNormalized[]
		raw: Plan[]
	}
	filters: {
		agency: string[]
		search: string
		validity_status: string[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
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
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.raw.map(item => item._id)));
	const [filterValidityStatus, setFilterValidityStatus] = useQueryState<string[]>('validity_status', parseAsArrayOfStrings.withDefault(planValidityStatusValues));

	//
	// B. Fetch data

	const { data: allPlansData, error: allPlansError, isLoading: allPlansLoading } = useSWR<Plan[], Error>('/api/plans', { refreshInterval: 5000 });

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
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency);
		const validityStatusSet = new Set(filterValidityStatus);
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
		actions: {
			setFilterAgency,
			setFilterSearch,
			setFilterValidityStatus,
		},
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
			loading: allPlansLoading,
		},
	}), [
		allPlansError,
		allPlansLoading,
		filterResultsData,
		filterValidityStatus,
		allPlansData,
		filterAgency,
		filterSearch,
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
