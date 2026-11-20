'use client';

import { type Zone } from '@tmlmobilidade/go-types-offer';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

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

	const { data, error, isLoading, isValidating, mutate, timestamp } = useZonesData();
	const agenciesAvailable = !agencyFilter.error && !agencyFilter.isLoading;

	//
	// C. Transform data

	const matches = useSearch<Zone>({ accessors: ['_id', 'name', 'code', 'agency_ids'], data, query: searchFilter.value });
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
