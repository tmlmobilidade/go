'use client';

import { type ValidationNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { normalizeString } from '@tmlmobilidade/strings';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useValidationsListFilterAgency } from './ValidationsListFilterAgency/use-validations-list-filter-agency';
import { useValidationsListFilterProcessingStatus } from './ValidationsListFilterProcessingStatus/use-validations-list-filter-processing-status';
import { useValidationsListFilterSearch } from './ValidationsListFilterSearch/use-validations-list-filter-search';
import { useValidationsListFilterValidityStatus } from './ValidationsListFilterValidityStatus/use-validations-list-filter-validity-status';

/* * */

interface UseValidationsListDataReturnType {
	data: ValidationNormalized[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	raw: GtfsValidation[]
	timestamp: null | UnixTimestamp
}

/* * */

export function useValidationsListData(): UseValidationsListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAgency = useValidationsListFilterAgency();

	const filterProcessingStatus = useValidationsListFilterProcessingStatus();

	const filterSearch = useValidationsListFilterSearch();

	const filterValidityStatus = useValidationsListFilterValidityStatus();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<GtfsValidation[]>>(API_ROUTES.plans.VALIDATIONS_LIST, {
		fetcher: async (url: string) => await fetchApiData<GtfsValidation[]>({ url }),
		refreshInterval: 3_000,
	});

	//
	// C. Transform data

	const normalizedValidationsData = useMemo<ValidationNormalized[]>(() => {
		if (!data?.data) return [];

		return data.data.map(item => ({
			...item,
			agency_code_normalized: item.gtfs_agency.agency_id,
			agency_id_normalized: item.agency_id,
			agency_name_normalized: normalizeString(item.gtfs_agency.agency_name),
		}));
	}, [data?.data]);

	const searchResultsData = useSearch<ValidationNormalized>({
		accessors: ['_id', 'agency_id_normalized', 'agency_name_normalized'],
		data: normalizedValidationsData,
		query: filterSearch.value,
	});

	const filteredValidationsData = useMemo(() => {
		const agencySet = new Set(filterAgency.value);
		const processingStatusSet = new Set(filterProcessingStatus.value);
		const validityStatusSet = new Set(filterValidityStatus.value);

		return searchResultsData.filter(item => (
			agencySet.has(item.agency_id)
			&& processingStatusSet.has(item.processing_status)
			&& validityStatusSet.has(item.validity_status)
		));
	}, [filterAgency.value, filterProcessingStatus.value, filterValidityStatus.value, searchResultsData]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filteredValidationsData,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		mutate,
		raw: data?.data ?? [],
		timestamp: data?.timestamp ?? null,
	}), [data, error, filteredValidationsData, isLoading, isValidating, mutate]);
}
