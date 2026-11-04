'use client';

import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useHolidaysAgenciesData } from '../shared/use-holidays-agencies-data';
import { useHolidaysData } from '../shared/use-holidays-data';
import { useHolidaysListFilterAgencies } from './HolidaysListFilterAgencies/use-holidays-list-filter-agencies';
import { useHolidaysListFilterSearch } from './HolidaysListFilterSearch/use-holidays-list-filter-search';

/* * */

interface UseHolidaysListDataReturnType {
	data: Holiday[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useHolidaysListData(): UseHolidaysListDataReturnType {
	//

	//
	// A. Setup variables

	const agencyFilter = useHolidaysListFilterAgencies();
	const searchFilter = useHolidaysListFilterSearch();

	//
	// B. Fetch data

	const { data, error: holidaysError, isLoading: holidaysLoading, isValidating, mutate, timestamp } = useHolidaysData();
	const { error: agenciesError, isLoading: agenciesLoading } = useHolidaysAgenciesData();
	const error = holidaysError ?? agenciesError;
	const isLoading = holidaysLoading || agenciesLoading;

	//
	// C. Transform data

	const dateOptions = useMemo(() => {
		const dates = [...new Set(data.flatMap(item => item.dates.map(String)))];
		return dates.sort().map(value => ({
			checked: false,
			disabled: false,
			label: value,
			value,
		}));
	}, [data]);
	const datesFilter = useFilterStateList('dates', [], dateOptions);
	const matches = useSearch<Holiday>({ accessors: ['_id', 'title', 'description', 'agency_ids'], data, query: searchFilter.value });
	const filtered = useMemo(() => {
		return matches
			.filter((item) => {
				const matchesAgencies = item.agency_ids.some(id => agencyFilter.value.includes(id));
				const matchesDates = !datesFilter.value.length || item.dates.some(date => datesFilter.value.includes(String(date)));
				return matchesAgencies && matchesDates;
			})
			.sort((a, b) => b.created_at - a.created_at);
	}, [matches, agencyFilter.value, datesFilter.value]);

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
