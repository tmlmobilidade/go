'use client';

import { type Typology } from '@tmlmobilidade/go-types-offer';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useTypologiesAgenciesData } from '../shared/use-typologies-agencies-data';
import { useTypologiesData } from '../shared/use-typologies-data';
import { useTypologiesListFilterAgencies } from './filters/TypologiesListFilterAgencies/use-typologies-list-filter-agencies';
import { useTypologiesListFilterSearch } from './filters/TypologiesListFilterSearch/use-typologies-list-filter-search';

/* * */

interface UseTypologiesListDataReturnType {
	data: Typology[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useTypologiesListData(): UseTypologiesListDataReturnType {
	//

	//
	// A. Setup variables

	const agencyFilter = useTypologiesListFilterAgencies();
	const searchFilter = useTypologiesListFilterSearch();

	//
	// B. Fetch data

	const { data, error: typologiesError, isLoading: typologiesLoading, isValidating, mutate, timestamp } = useTypologiesData();
	const { error: agenciesError, isLoading: agenciesLoading } = useTypologiesAgenciesData();
	const error = typologiesError ?? agenciesError;
	const isLoading = typologiesLoading || agenciesLoading;

	//
	// C. Transform data

	const matches = useSearch<Typology>({ accessors: ['_id', 'name', 'code', 'agency_ids'], data, query: searchFilter.value });
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
