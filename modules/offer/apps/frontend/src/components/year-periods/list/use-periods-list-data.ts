'use client';

import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { usePeriodsData } from '../shared/use-periods-data';
import { usePeriodsListFilterAgencies } from './PeriodsListFilterAgencies/use-periods-list-filter-agencies';
import { usePeriodsListFilterSearch } from './PeriodsListFilterSearch/use-periods-list-filter-search';

/* * */

interface UsePeriodsListDataReturnType {
	data: YearPeriod[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function usePeriodsListData(): UsePeriodsListDataReturnType {
	//

	//
	// A. Setup variables

	const agencyFilter = usePeriodsListFilterAgencies();
	const searchFilter = usePeriodsListFilterSearch();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate, timestamp } = usePeriodsData();
	const agenciesAvailable = !agencyFilter.error && !agencyFilter.isLoading;

	//
	// C. Transform data

	const matches = useSearch<YearPeriod>({ accessors: ['_id', 'name', 'short_name', 'code', 'agency_ids'], data, query: searchFilter.value });
	const filtered = useMemo(() => {
		return matches
			.filter((item) => {
				if (!agenciesAvailable || !agencyFilter.isActive) return true;
				return item.agency_ids.some(id => agencyFilter.value.includes(id));
			})
			.sort((a, b) => b.created_at - a.created_at);
	}, [matches, agenciesAvailable, agencyFilter.isActive, agencyFilter.value]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filtered,
		error,
		isLoading,
		isValidating,
		mutate,
		timestamp,
	}), [filtered, error, isLoading, isValidating, mutate, timestamp]);
}
