'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Period } from '@tmlmobilidade/types';
import { parseAsArrayOfStrings, useSearch } from '@tmlmobilidade/ui';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PeriodNormalized extends Period {
	agency_id_normalized: string
	id: string
}

/* * */

interface PeriodsListContextState {
	actions: {
		setFilterAgency: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		all: PeriodNormalized[]
		filtered: PeriodNormalized[]
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

const PeriodsListContext = createContext<PeriodsListContextState | undefined>(undefined);

export const usePeriodsListContext = () => {
	const context = useContext(PeriodsListContext);
	if (!context) {
		throw new Error('usePeriodsListContext must be used within a PeriodsListContextProvider');
	}
	return context;
};

/* * */

export const PeriodsListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.raw.map(item => item._id)));

	//
	// B. Fetch data

	const { data: allPeriodsData, error: allPeriodsError, isLoading: allPeriodsLoading } = useSWR<Period[], Error>(API_ROUTES.dates.PERIODS_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const normalizedPeriodsData: PeriodNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allPeriodsData) return [];
		// Normalize record fields
		return allPeriodsData.map((item) => {
			return {
				...item,
				agency_id_normalized: normalizeString(item.agency_id),
				id: item._id,
			};
		});
	}, [allPeriodsData, agenciesContext.data.raw]);

	const searchResultsData = useSearch<PeriodNormalized>({
		accessors: ['_id', 'name', 'agency_id_normalized'],
		data: normalizedPeriodsData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency);

		return searchResultsData
			.filter((item: PeriodNormalized) => {
				// Filter by agency - check if the period's agency matches the filter
				if (filterAgency.length > 0) {
					if (!item.agency_id) {
						return true; // Show periods with no agency in all filters
					}
					const hasMatchingAgency = agencySet.has(item.agency_id);
					if (!hasMatchingAgency) return false;
				}

				// Return true if all filters pass
				return true;
			});
	}, [searchResultsData, filterAgency]);

	//
	// D. Define context value

	const contextValue: PeriodsListContextState = useMemo(() => ({
		actions: {
			setFilterAgency,
			setFilterSearch,
		},
		data: {
			all: normalizedPeriodsData ?? [],
			filtered: filterResultsData,
		},
		filters: {
			agency: filterAgency,
			search: filterSearch,
		},
		flags: {
			error: allPeriodsError,
			loading: allPeriodsLoading,
		},
	}), [
		allPeriodsError,
		allPeriodsLoading,
		filterResultsData,
		allPeriodsData,
		filterAgency,
		filterSearch,
	]);

	//
	// E. Render components

	return (
		<PeriodsListContext.Provider value={contextValue}>
			{children}
		</PeriodsListContext.Provider>
	);

	//
};
