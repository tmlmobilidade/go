'use client';

import { type AnnotationNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Annotation, PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AnnotationsListContextState {
	data: {
		filtered: AnnotationNormalized[]
		raw: Annotation[]
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

const AnnotationsListContext = createContext<AnnotationsListContextState | undefined>(undefined);

export const useAnnotationsListContext = () => {
	const context = useContext(AnnotationsListContext);
	if (!context) {
		throw new Error('useAnnotationsListContext must be used within a AnnotationsListContextProvider');
	}
	return context;
};

/* * */

export const AnnotationsListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.annotations.actions.read],
		scope: PermissionCatalog.all.annotations.scope,
	});

	const { data: allAnnotationsData, error: allAnnotationsError, isLoading: allAnnotationsLoading } = useSWR<Annotation[], Error>(API_ROUTES.dates.ANNOTATIONS_LIST);

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	// Get all unique dates from annotations for the dates filter
	const allDatesOptions = useMemo(() => {
		if (!allAnnotationsData) return [];
		const uniqueDates = new Set<string>();
		allAnnotationsData.forEach((annotation) => {
			annotation.dates.forEach(date => uniqueDates.add(String(date)));
		});
		return Array.from(uniqueDates).sort().map(date => ({
			checked: false,
			disabled: false,
			label: date,
			value: date,
		}));
	}, [allAnnotationsData]);

	const filterDates = useFilterStateList('dates', [], allDatesOptions);

	//
	// C. Transform data

	const normalizedAnnotationsData: AnnotationNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allAnnotationsData) return [];
		// Normalize record fields
		return allAnnotationsData.map((item) => {
			// Get agency IDs for normalization
			const agencyIds = item.agency_ids.join(', ');

			return {
				...item,
				agency_ids_normalized: normalizeString(agencyIds),
			};
		});
	}, [allAnnotationsData]);

	const searchResultsData = useSearch<AnnotationNormalized>({
		accessors: ['_id', 'title', 'description', 'agency_ids_normalized'],
		data: normalizedAnnotationsData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency.value);
		const datesSet = new Set(filterDates.value);

		return searchResultsData
			.filter((item: AnnotationNormalized) => {
				// Filter by agency - check if any of the annotation's agencies match the filter
				if (!item.agency_ids.some(agencyId => agencySet.has(agencyId))) return false;

				// Filter by dates - check if any of the annotation's dates match the filter
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

	const contextValue: AnnotationsListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allAnnotationsData ?? [],
		},
		filters: {
			agency: filterAgency,
			dates: filterDates,
			search: filterSearch,
		},
		flags: {
			error: allAnnotationsError,
			loading: allAnnotationsLoading,
		},
	}), [
		allAnnotationsError,
		allAnnotationsLoading,
		filterResultsData,
		filterDates,
		allAnnotationsData,
		filterAgency,
		filterSearch,
	]);

	//
	// E. Render components

	return (
		<AnnotationsListContext.Provider value={contextValue}>
			{children}
		</AnnotationsListContext.Provider>
	);

	//
};
