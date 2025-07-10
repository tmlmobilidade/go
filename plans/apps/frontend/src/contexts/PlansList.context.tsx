'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { type PlanNormalized } from '@/types/normalized';
import { type Plan } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
import { normalizeString, swrFetcher } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PlansListContextState {
	actions: {
		setFilterAgency: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: PlanNormalized[]
		raw: Plan[]
	}
	filters: {
		agency: string[]
		search: string
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
	const [filterAgency, setFilterAgency] = useQueryState<string[]>('municipality', parseAsArrayOfStrings.withDefault(agenciesContext.data.raw.map(item => item._id)));

	//
	// B. Fetch data

	const { data: allPlansData, error: allPlansError, isLoading: allPlansLoading } = useSWR<Plan[], Error>('/api/plans', swrFetcher);

	//
	// C. Transform data

	const normalizedAlertsData: PlanNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allPlansData) return [];
		// Normalize record fields
		return allPlansData.map(item => ({
			...item,
			agency_id_normalized: item.gtfs_agency.agency_id,
			agency_name_normalized: normalizeString(item.gtfs_agency.agency_name),
		}));
	}, [allPlansData]);

	const searchResultsData = useSearch<PlanNormalized>({
		accessors: ['_id', 'agency_name_normalized'],
		data: normalizedAlertsData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency);
		return searchResultsData.filter((item: PlanNormalized) => {
			// Filter by publish_status
			if (!agencySet.has(item.gtfs_agency.agency_id)) return false;
			// Return true if all filters pass
			return true;
		});
	}, [searchResultsData, filterAgency]);

	//
	// D. Define context value

	const contextValue: PlansListContextState = useMemo(() => ({
		actions: {
			setFilterAgency,
			setFilterSearch,
		},
		data: {
			filtered: filterResultsData,
			raw: allPlansData ?? [],
		},
		filters: {
			agency: filterAgency,
			search: filterSearch,
		},
		flags: {
			error: allPlansError,
			loading: allPlansLoading,
		},
	}), [
		allPlansError,
		allPlansLoading,
		filterResultsData,
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
