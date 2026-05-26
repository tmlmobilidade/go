'use client';

import { type HolidayNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Holiday, PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface HolidaysListContextState {
	data: {
		filtered: HolidayNormalized[]
		raw: Holiday[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		dates: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const HolidaysListContext = createContext<HolidaysListContextState | undefined>(undefined);

export const useHolidaysListContext = () => {
	const context = useContext(HolidaysListContext);
	if (!context) {
		throw new Error('useHolidaysListContext must be used within a HolidaysListContextProvider');
	}
	return context;
};

/* * */

export const HolidaysListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.holidays.actions.read],
		scope: PermissionCatalog.all.holidays.scope,
	});

	const { data: allHolidaysData, error: allHolidaysError, isLoading: allHolidaysLoading } = useSWR<Holiday[], Error>(API_ROUTES.dates.HOLIDAYS_LIST);

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	// Get all unique dates from holidays for the dates filter
	const allDatesOptions = useMemo(() => {
		if (!allHolidaysData) return [];
		const uniqueDates = new Set<string>();
		allHolidaysData.forEach((holiday) => {
			holiday.dates.forEach(date => uniqueDates.add(String(date)));
		});
		return Array.from(uniqueDates).sort().map(date => ({
			checked: false,
			disabled: false,
			label: date,
			value: date,
		}));
	}, [allHolidaysData]);

	const filterDates = useFilterStateList('dates', [], allDatesOptions);

	//
	// C. Transform data

	const normalizedHolidaysData: HolidayNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allHolidaysData) return [];
		// Normalize record fields
		return allHolidaysData.map((item) => {
			// Get agency IDs for normalization
			const agencyIds = item.agency_ids.join(', ');

			return {
				...item,
				agency_ids_normalized: normalizeString(agencyIds),
			};
		});
	}, [allHolidaysData]);

	const searchResultsData = useSearch<HolidayNormalized>({
		accessors: ['_id', 'title', 'description', 'agency_ids_normalized'],
		data: normalizedHolidaysData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency.value);
		const datesSet = new Set(filterDates.value);

		return searchResultsData
			.filter((item: HolidayNormalized) => {
				// Filter by agency - check if any of the holiday's agencies match the filter
				if (!item.agency_ids.some(agencyId => agencySet.has(agencyId))) return false;

				// Filter by dates - check if any of the holiday's dates match the filter
				if (filterDates.value.length > 0) {
					const hasMatchingDate = item.dates.some(date => datesSet.has(String(date)));
					if (!hasMatchingDate) return false;
				}

				// Return true if all filters pass
				return true;
			})
			.sort((a, b) => {
				// Sort by created_at descending (newest first)
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [searchResultsData, filterAgency, filterDates]);

	//
	// D. Define context value

	const contextValue: HolidaysListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allHolidaysData ?? [],
		},
		filters: {
			agency: filterAgency,
			dates: filterDates,
			search: filterSearch,
		},
		flags: {
			error: allHolidaysError,
			loading: allHolidaysLoading,
		},
	}), [
		allHolidaysError,
		allHolidaysLoading,
		filterResultsData,
		filterDates,
		allHolidaysData,
		filterAgency,
		filterSearch,
	]);

	//
	// E. Render components

	return (
		<HolidaysListContext.Provider value={contextValue}>
			{children}
		</HolidaysListContext.Provider>
	);

	//
};
