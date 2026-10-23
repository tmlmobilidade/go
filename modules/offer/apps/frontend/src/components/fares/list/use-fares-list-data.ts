'use client';

import { type Fare } from '@tmlmobilidade/go-types-offer';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useFaresAgenciesData } from '../shared/use-fares-agencies-data';
import { useFaresData } from '../shared/use-fares-data';
import { useFaresListFilterAgencies } from './filters/FaresListFilterAgencies/use-fares-list-filter-agencies';
import { useFaresListFilterSearch } from './filters/FaresListFilterSearch/use-fares-list-filter-search';

/* * */

interface UseFaresListDataReturnType {
	data: Fare[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useFaresListData(): UseFaresListDataReturnType {
	//

	//
	// A. Setup variables

	const agencyFilter = useFaresListFilterAgencies();
	const searchFilter = useFaresListFilterSearch();

	//
	// B. Fetch data

	const { data, error: faresError, isLoading: faresLoading, isValidating, mutate, timestamp } = useFaresData();
	const { error: agenciesError, isLoading: agenciesLoading } = useFaresAgenciesData();
	const error = faresError ?? agenciesError;
	const isLoading = faresLoading || agenciesLoading;

	//
	// C. Transform data

	const matches = useSearch<Fare>({ accessors: ['_id', 'name', 'code', 'agency_ids'], data, query: searchFilter.value });
	const filtered = useMemo(() => {
		return matches
			.filter((item) => {
				const matchesAgencies = item.agency_ids.some(id => agencyFilter.value.includes(id));
				return matchesAgencies;
			})
			.sort((a, b) => b.created_at - a.created_at);
	}, [matches, agencyFilter.value]);

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
