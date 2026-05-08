'use client';

import { type ValidationNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type GtfsValidation, PermissionCatalog, ProcessingStatusSchema, ValidityStatusSchema } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

interface ValidationsListContextState {
	data: {
		filtered: ValidationNormalized[]
		raw: GtfsValidation[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		processing_status: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
		validity_status: UseFilterStateListReturnType
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

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<GtfsValidation[], Error>(API_ROUTES.plans.VALIDATIONS_LIST, { refreshInterval: 3_000 });

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.gtfs_validations.actions.read],
		scope: PermissionCatalog.all.gtfs_validations.scope,
	});

	//
	// C. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
	const filterProcessingStatus = useFilterStateList('processing_status', ProcessingStatusSchema.options, ProcessingStatusSchema.options.map(item => ({ label: t(`shared:status.processing_status.${item}`), value: item })));
	const filterValidityStatus = useFilterStateList('validity_status', ValidityStatusSchema.options, ValidityStatusSchema.options.map(item => ({ label: t(`shared:status.validity_status.${item}`), value: item })));

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
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency.value);
		const processingStatusSet = new Set(filterProcessingStatus.value);
		const validityStatusSet = new Set(filterValidityStatus.value);
		const filteredResultsData = searchResultsData.filter((item: ValidationNormalized) => {
			// Filter by agency
			if (!agencySet.has(item.gtfs_agency.agency_id)) return false;
			// Filter by processing_status
			if (!processingStatusSet.has(item.processing_status)) return false;
			// Filter by validity_status
			if (!validityStatusSet.has(item.validity_status)) return false;
			// Return true if all filters pass
			return true;
		});
		return filteredResultsData;
	}, [
		searchResultsData,
		filterAgency,
		filterProcessingStatus.value,
		filterValidityStatus.value,
	]);

	//
	// D. Define context value

	const contextValue: ValidationsListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allValidationsData ?? [],
		},
		filters: {
			agency: filterAgency,
			processing_status: filterProcessingStatus,
			search: filterSearch,
			validity_status: filterValidityStatus,
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
		filterValidityStatus,
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
