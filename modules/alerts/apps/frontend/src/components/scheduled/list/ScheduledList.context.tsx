'use client';

/* * */

import { type AlertNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Alert, AlertSchema, PublishStatusSchema } from '@tmlmobilidade/types';
import { parseAsArrayOfStrings, useLocationsContext, useSearch } from '@tmlmobilidade/ui';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ScheduledListContextState {
	actions: {
		setFilterCause: (values: string[]) => void
		setFilterEffect: (values: string[]) => void
		setFilterMunicipality: (values: string[]) => void
		setFilterPublishStatus: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: Alert[]
		raw: Alert[]
	}
	filters: {
		cause: string[]
		effect: string[]
		municipality: string[]
		publish_status: string[]
		search: string
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const ScheduledListContext = createContext<ScheduledListContextState | undefined>(undefined);

export const useScheduledListContext = () => {
	const context = useContext(ScheduledListContext);
	if (!context) {
		throw new Error('useScheduledListContext must be used within an ScheduledListContextProvider');
	}
	return context;
};

/* * */

export const ScheduledListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterPublishStatus, setFilterPublishStatus] = useQueryState<string[]>('publish_status', parseAsArrayOfStrings.withDefault(PublishStatusSchema.options));
	const [filterCause, setFilterCause] = useQueryState<string[]>('cause', parseAsArrayOfStrings.withDefault(AlertSchema.shape.cause.options));
	const [filterEffect, setFilterEffect] = useQueryState<string[]>('effect', parseAsArrayOfStrings.withDefault(AlertSchema.shape.effect.options));
	const [filterMunicipality, setFilterMunicipality] = useQueryState<string[]>('municipality', parseAsArrayOfStrings.withDefault(locationsContext.data.municipality_ids));

	//
	// B. Fetch data

	const { data: allAlertsData, error: allAlertsError, isLoading: allAlertsLoading } = useSWR<Alert[], Error>(API_ROUTES.alerts.SCHEDULED_LIST);

	//
	// C. Transform data

	const normalizedAlertsData: AlertNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allAlertsData) return [];
		// Normalize record fields
		return allAlertsData.map(item => ({
			...item,
			description_normalized: normalizeString(item.description),
			title_normalized: normalizeString(item.title),
		}));
	}, [allAlertsData]);

	const searchResultsData = useSearch<AlertNormalized>({
		accessors: ['title_normalized', 'description_normalized'],
		data: normalizedAlertsData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];

		// Skip if no query filters are set
		if (filterPublishStatus.length === 0 && filterCause.length === 0 && filterEffect.length === 0 && filterMunicipality.length === 0) return searchResultsData;

		// 1. Convert filter arrays to sets for O(1) membership checks
		const filterPublishStatusSet = new Set(filterPublishStatus);
		const filterCauseSet = new Set(filterCause);
		const filterEffectSet = new Set(filterEffect);
		const filterMunicipalitySet = new Set(filterMunicipality);

		// 2. Filter by query filters

		return searchResultsData.filter((alert: AlertNormalized) => {
			// Filter by publish_status
			if (!filterPublishStatusSet.has(alert.publish_status)) return false;
			// Filter by cause
			if (!filterCauseSet.has(alert.cause)) return false;
			// Filter by effect
			if (!filterEffectSet.has(alert.effect)) return false;
			// Filter by municipality
			if (filterMunicipality.length > 0 && !alert.municipality_ids.some((mId: string) => filterMunicipalitySet.has(mId))) return false;
			// Return true if all filters pass
			return true;
		});
	}, [searchResultsData, filterPublishStatus, filterCause, filterEffect, filterMunicipality, filterPublishStatus, filterCause, filterEffect, filterMunicipality]);

	//
	// E. Define context value

	const contextValue: ScheduledListContextState = useMemo(() => ({
		actions: {
			setFilterCause: setFilterCause,
			setFilterEffect: setFilterEffect,
			setFilterMunicipality: setFilterMunicipality,
			setFilterPublishStatus: setFilterPublishStatus,
			setFilterSearch: setFilterSearch,
		},
		data: {
			filtered: filterResultsData,
			raw: allAlertsData,
		},
		filters: {
			cause: filterCause,
			effect: filterEffect,
			municipality: filterMunicipality,
			publish_status: filterPublishStatus,
			search: filterSearch,
		},
		flags: {
			error: allAlertsError,
			loading: allAlertsLoading,
		},
	}), [
		allAlertsData,
		filterResultsData,
		allAlertsLoading,
		allAlertsError,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		filterSearch,
	]);

	//
	// E. Render components

	return (
		<ScheduledListContext.Provider value={contextValue}>
			{children}
		</ScheduledListContext.Provider>
	);

	//
};
