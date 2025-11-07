'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { type ValidationNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type GtfsValidation, PROCESSING_STATUS_OPTIONS } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
import { normalizeString } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ValidationsListContextState {
	actions: {
		setFilterAgency: (values: string[]) => void
		setFilterProcessingStatus: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: ValidationNormalized[]
		raw: GtfsValidation[]
	}
	filters: {
		agency: string[]
		processing_status: string[]
		search: string
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const ValidationsListContext = createContext<undefined | ValidationsListContextState>(undefined);

export const useValidationsListContext = () => {
	const context = useContext(ValidationsListContext);
	if (!context) {
		throw new Error('useValidationsListContext must be used within a ValidationsListContextProvider');
	}
	return context;
};

/* * */

export const ValidationsListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.raw.map(item => item._id)));
	const [filterProcessingStatus, setFilterProcessingStatus] = useQueryState<string[]>('processing_status', parseAsArrayOfStrings.withDefault([...PROCESSING_STATUS_OPTIONS]));

	//
	// B. Fetch data

	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<GtfsValidation[], Error>(API_ROUTES.plans.VALIDATIONS_LIST, { refreshInterval: 3_000 });

	//
	// C. Transform data

	const normalizedValidationsData: ValidationNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allValidationsData) return [];
		// Normalize record fields
		return allValidationsData.map(item => ({
			...item,
			agency_id_normalized: item.gtfs_agency.agency_id,
			agency_name_normalized: normalizeString(item.gtfs_agency.agency_name),
		}));
	}, [allValidationsData]);

	const searchResultsData = useSearch<ValidationNormalized>({
		accessors: ['_id', 'agency_name_normalized'],
		data: normalizedValidationsData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency);
		const validityStatusSet = new Set(filterProcessingStatus);
		const filteredResultsData = searchResultsData.filter((item: ValidationNormalized) => {
			// Filter by agency
			if (!agencySet.has(item.gtfs_agency.agency_id)) return false;
			// Filter by validity_status
			if (!validityStatusSet.has(item.feeder_status)) return false;
			// Return true if all filters pass
			return true;
		});
		return filteredResultsData;
	}, [searchResultsData, filterAgency]);

	//
	// D. Define context value

	const contextValue: ValidationsListContextState = useMemo(() => ({
		actions: {
			setFilterAgency,
			setFilterProcessingStatus,
			setFilterSearch,
		},
		data: {
			filtered: filterResultsData,
			raw: allValidationsData ?? [],
		},
		filters: {
			agency: filterAgency,
			processing_status: filterProcessingStatus,
			search: filterSearch,
		},
		flags: {
			error: allValidationsError,
			loading: allValidationsLoading,
		},
	}), [
		filterResultsData,
		allValidationsData,
		filterAgency,
		filterProcessingStatus,
		filterSearch,
		allValidationsError,
		allValidationsLoading,
	]);

	//
	// E. Render components

	return (
		<ValidationsListContext.Provider value={contextValue}>
			{children}
		</ValidationsListContext.Provider>
	);

	//
};
