'use client';

import { type Fare } from '@tmlmobilidade/go-types-offer';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

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

	const { data, error, isLoading, isValidating, mutate, timestamp } = useFaresData();
	const agenciesAvailable = !agencyFilter.error && !agencyFilter.isLoading;

	//
	// C. Transform data

	const matches = useSearch<Fare>({ accessors: ['_id', 'name', 'code', 'agency_ids'], data, query: searchFilter.value });
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
