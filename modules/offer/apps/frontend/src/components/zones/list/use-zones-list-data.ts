'use client';

import { type Zone } from '@tmlmobilidade/go-types-offer';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useZonesAgenciesData } from '../shared/use-zones-agencies-data';
import { useZonesData } from '../shared/use-zones-data';
import { useZonesListFilterAgencies } from './filters/ZonesListFilterAgencies/use-zones-list-filter-agencies';
import { useZonesListFilterSearch } from './filters/ZonesListFilterSearch/use-zones-list-filter-search';

/* * */

interface UseZonesListDataReturnType {
	data: Zone[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useZonesListData(): UseZonesListDataReturnType {
	//

	//
	// A. Setup variables

	const agencyFilter = useZonesListFilterAgencies();
	const searchFilter = useZonesListFilterSearch();

	//
	// B. Fetch data

	const { data, error: zonesError, isLoading: zonesLoading, isValidating, mutate, timestamp } = useZonesData();
	const { error: agenciesError, isLoading: agenciesLoading } = useZonesAgenciesData();
	const error = zonesError ?? agenciesError;
	const isLoading = zonesLoading || agenciesLoading;

	//
	// C. Transform data

	const matches = useSearch<Zone>({ accessors: ['_id', 'name', 'code', 'agency_ids'], data, query: searchFilter.value });
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
