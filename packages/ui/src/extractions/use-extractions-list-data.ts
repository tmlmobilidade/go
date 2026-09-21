'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useExtractionsListFilterProcessingStatus } from './filters/ExtractionsListFilterProcessingStatus/use-extractions-list-filter-processing-status';
import { useExtractionsListFilterSearch } from './filters/ExtractionsListFilterSearch/use-extractions-list-filter-search';
import { useExtractionsListFilterVersion } from './filters/ExtractionsListFilterVersion/use-extractions-list-filter-version';

/* * */

interface UseExtractionsListDataReturnType {
	data: Extraction[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (data?: ApiResponse<Extraction[]>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useExtractionsListData(): UseExtractionsListDataReturnType {
	//

	//
	// A. Setup variables

	const filterSearch = useExtractionsListFilterSearch();
	const filterVersion = useExtractionsListFilterVersion();
	const filterProcessingStatus = useExtractionsListFilterProcessingStatus();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR(API_ROUTES.core.EXTRACTIONS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Extraction[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<Extraction>({
		accessors: ['_id'],
		data: data?.data,
		query: filterSearch.value,
	});

	const filteredData = useMemo(() => {
		if (!searchResultsData?.length) return [];
		return searchResultsData
			.filter(item => filterVersion.value.includes(item.version))
			.filter(item => filterProcessingStatus.value.includes(item.processing_status))
			.sort((a, b) => b.created_at - a.created_at);
	}, [searchResultsData, filterVersion.value, filterProcessingStatus.value]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filteredData,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [filteredData, data?.timestamp, error, isLoading, isValidating, mutate]);
};
