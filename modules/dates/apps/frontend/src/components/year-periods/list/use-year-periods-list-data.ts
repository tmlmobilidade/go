'use client';

import { type YearPeriodNormalized } from '@/types/normalized';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { normalizeString } from '@tmlmobilidade/strings';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useYearPeriodsRawData } from '../shared/use-year-periods-raw-data';
import { useYearPeriodsListFilterAgency } from './filters/YearPeriodsListFilterAgency/use-year-periods-list-filter-agency';
import { useYearPeriodsListFilterSearch } from './filters/YearPeriodsListFilterSearch/use-year-periods-list-filter-search';

/* * */

interface UseYearPeriodsListDataReturnType {
	data: YearPeriodNormalized[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useYearPeriodsListData(): UseYearPeriodsListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAgency = useYearPeriodsListFilterAgency();
	const filterSearch = useYearPeriodsListFilterSearch();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate, timestamp } = useYearPeriodsRawData();

	//
	// C. Transform data

	const normalizedData = useMemo(() => {
		// Normalize the record fields used by the search
		return data.map((item): YearPeriodNormalized => ({
			...item,
			agency_ids_normalized: normalizeString(item.agency_ids.join(', ')),
		}));
	}, [data]);

	const searchResultsData = useSearch<YearPeriodNormalized>({
		accessors: ['_id', 'name', 'agency_ids_normalized'],
		data: normalizedData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// Convert the filter array to a set for O(1) membership checks
		const agencySet = new Set(filterAgency.value);
		// Year periods without agencies are always shown; the others need at least one matching agency
		return searchResultsData.filter((item) => {
			if (!item.agency_ids || item.agency_ids.length === 0) return true;
			return item.agency_ids.some(agencyId => agencySet.has(agencyId));
		});
	}, [searchResultsData, filterAgency.value]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filterResultsData,
		error,
		isLoading,
		isValidating,
		mutate,
		timestamp,
	}), [filterResultsData, error, isLoading, isValidating, mutate, timestamp]);
};
