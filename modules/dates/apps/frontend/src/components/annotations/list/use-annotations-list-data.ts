'use client';

import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { summarizeLocations } from '@tmlmobilidade/go-types-locations';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAnnotationsAgenciesData } from '../shared/use-annotations-agencies-data';
import { useAnnotationsData } from '../shared/use-annotations-data';
import { ANNOTATIONS_WITHOUT_AGENCIES, useAnnotationsListFilterAgencies } from './AnnotationsListFilterAgencies/use-annotations-list-filter-agencies';
import { useAnnotationsListFilterSearch } from './AnnotationsListFilterSearch/use-annotations-list-filter-search';
import { ANNOTATIONS_WITHOUT_CATEGORY, useAnnotationsListFilterCategories } from './filters/AnnotationsListFilterCategories/use-annotations-list-filter-categories';
import { useAnnotationsListFilterDates } from './filters/AnnotationsListFilterDates/use-annotations-list-filter-dates';
import { ANNOTATIONS_WITHOUT_LOCATIONS, useAnnotationsListFilterLocations } from './filters/AnnotationsListFilterLocations/use-annotations-list-filter-locations';

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

	const { t } = useTranslation();
	const agencyFilter = useAnnotationsListFilterAgencies();
	const categoryFilter = useAnnotationsListFilterCategories();
	const datesFilter = useAnnotationsListFilterDates();
	const locationFilter = useAnnotationsListFilterLocations();
	const searchFilter = useAnnotationsListFilterSearch();

	//
	// B. Fetch data

	const { data, error: annotationsError, isLoading: annotationsLoading, isValidating, mutate, timestamp } = useAnnotationsData();
	const { error: agenciesError, isLoading: agenciesLoading } = useAnnotationsAgenciesData();
	const error = annotationsError ?? agenciesError ?? (locationFilter.isActive ? locationFilter.error : null);
	const isLoading = annotationsLoading || agenciesLoading || (locationFilter.isActive && locationFilter.isLoading);

	//
	// C. Transform data

	const searchData = useMemo(() => data.map(item => ({
		...item,
		search_text: [
			item.source,
			item.impact,
			...summarizeLocations(item.locations ?? [], true).flatMap(location => [location.label, location.name]),
			...(item.locations ?? []).map(location => location.name),
			item.category ? t(`annotations:categories.values.${item.category}`) : t('annotations:categories.uncategorized'),
		].filter(Boolean).join(' '),
	})), [data, t]);
	const matches = useSearch({ accessors: ['_id', 'title', 'description', 'agency_ids', 'search_text'], data: searchData, query: searchFilter.value });
	const filtered = useMemo(() => {
		return matches
			.filter((item) => {
				const matchesAgencies = item.agency_ids.length
					? item.agency_ids.some(id => agencyFilter.value.includes(id))
					: agencyFilter.value.includes(ANNOTATIONS_WITHOUT_AGENCIES);
				const matchesDates = !datesFilter.isActive || item.dates.some(date =>
					(!datesFilter.startDate || date >= datesFilter.startDate) && (!datesFilter.endDate || date <= datesFilter.endDate));
				const matchesLocations = !locationFilter.value.length || (item.locations?.length
					? item.locations.some(location => locationFilter.matchingIds.has(String(location.osm_id)))
					: locationFilter.value.includes(ANNOTATIONS_WITHOUT_LOCATIONS));
				const matchesCategory = categoryFilter.value.includes(item.category ?? ANNOTATIONS_WITHOUT_CATEGORY);
				return matchesAgencies && matchesDates && matchesCategory && matchesLocations;
			})
			.sort((a, b) => Math.max(0, ...b.dates) - Math.max(0, ...a.dates) || b.created_at - a.created_at || a._id.localeCompare(b._id));
	}, [matches, agencyFilter.value, categoryFilter.value, datesFilter.isActive, datesFilter.startDate, datesFilter.endDate, locationFilter.value, locationFilter.matchingIds]);

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
