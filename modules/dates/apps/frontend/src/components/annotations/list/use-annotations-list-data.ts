'use client';

import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useAnnotationsAgenciesData } from '../shared/use-annotations-agencies-data';
import { useAnnotationsData } from '../shared/use-annotations-data';
import { useAnnotationsListFilterAgencies } from './AnnotationsListFilterAgencies/use-annotations-list-filter-agencies';
import { useAnnotationsListFilterSearch } from './AnnotationsListFilterSearch/use-annotations-list-filter-search';

/* * */

interface UseAnnotationsListDataReturnType {
	data: Annotation[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAnnotationsListData(): UseAnnotationsListDataReturnType {
	//

	//
	// A. Setup variables

	const agencyFilter = useAnnotationsListFilterAgencies();
	const searchFilter = useAnnotationsListFilterSearch();

	//
	// B. Fetch data

	const { data, error: annotationsError, isLoading: annotationsLoading, isValidating, mutate, timestamp } = useAnnotationsData();
	const { error: agenciesError, isLoading: agenciesLoading } = useAnnotationsAgenciesData();
	const error = annotationsError ?? agenciesError;
	const isLoading = annotationsLoading || agenciesLoading;

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
	const matches = useSearch<Annotation>({ accessors: ['_id', 'title', 'description', 'agency_ids'], data, query: searchFilter.value });
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
