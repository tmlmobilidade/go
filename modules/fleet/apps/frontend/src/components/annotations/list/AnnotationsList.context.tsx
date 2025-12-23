'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Annotation } from '@tmlmobilidade/types';
import { parseAsArrayOfStrings, useSearch } from '@tmlmobilidade/ui';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AnnotationNormalized extends Annotation {
	agency_ids_normalized: string
	dates_normalized: string[]
}

/* * */

interface AnnotationsListContextState {
	actions: {
		setFilterAgency: (values: string[]) => void
		setFilterDates: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: AnnotationNormalized[]
		raw: Annotation[]
	}
	filters: {
		agency: string[]
		dates: string[]
		search: string
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
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.raw.map(item => item._id)));
	const [filterDates, setFilterDates] = useQueryState<string[]>('dates', parseAsArrayOfStrings.withDefault([]));

	//
	// B. Fetch data

	const { data: allAnnotationsData, error: allAnnotationsError, isLoading: allAnnotationsLoading } = useSWR<Annotation[], Error>(API_ROUTES.fleet.ANNOTATIONS_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const normalizedAnnotationsData: AnnotationNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allAnnotationsData) return [];
		// Normalize record fields
		return allAnnotationsData.map((item) => {
			// Get agency names for this annotation
			const agencyIds = item.agency_ids.join(', ');

			return {
				...item,
				agency_ids_normalized: normalizeString(agencyIds),
				dates_normalized: item.dates.map(date => String(date)),
			};
		});
	}, [allAnnotationsData, agenciesContext.data.raw]);

	const searchResultsData = useSearch<AnnotationNormalized>({
		accessors: ['_id', 'title', 'description', 'agency_ids_normalized'],
		data: normalizedAnnotationsData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency);
		const datesSet = new Set(filterDates);

		return searchResultsData
			.filter((item: AnnotationNormalized) => {
				// Filter by agency - check if any of the annotation's agencies match the filter
				// If annotation has no agencies (null or empty), show it in all results
				if (filterAgency.length > 0) {
					if (!item.agency_ids || item.agency_ids.length === 0) {
						return true; // Show annotations with no agencies in all filters
					}
					const hasMatchingAgency = item.agency_ids.some(agencyId => agencySet.has(agencyId));
					if (!hasMatchingAgency) return false;
				}

				// Filter by dates - check if any of the annotation's dates match the filter
				if (filterDates.length > 0) {
					const hasMatchingDate = item.dates_normalized.some(date => datesSet.has(date));
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
		actions: {
			setFilterAgency,
			setFilterDates,
			setFilterSearch,
		},
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
