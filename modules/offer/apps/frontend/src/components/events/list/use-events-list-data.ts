'use client';

import { type Event } from '@tmlmobilidade/go-types-offer';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useEventsAgenciesData } from '../shared/use-events-agencies-data';
import { useEventsData } from '../shared/use-events-data';
import { useEventsListFilterAgencies } from './EventsListFilterAgencies/use-events-list-filter-agencies';
import { useEventsListFilterSearch } from './EventsListFilterSearch/use-events-list-filter-search';

/* * */

interface UseEventsListDataReturnType {
	data: Event[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useEventsListData(): UseEventsListDataReturnType {
	//

	//
	// A. Setup variables

	const agencyFilter = useEventsListFilterAgencies();
	const searchFilter = useEventsListFilterSearch();

	//
	// B. Fetch data

	const { data, error: eventsError, isLoading: eventsLoading, isValidating, mutate, timestamp } = useEventsData();
	const { error: agenciesError, isLoading: agenciesLoading } = useEventsAgenciesData();
	const error = eventsError ?? agenciesError;
	const isLoading = eventsLoading || agenciesLoading;

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
	const matches = useSearch<Event>({ accessors: ['_id', 'title', 'description', 'agency_ids'], data, query: searchFilter.value });
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
