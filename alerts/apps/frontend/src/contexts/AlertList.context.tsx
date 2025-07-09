'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { swrFetcher } from '@/lib/http';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { type AlertNormalized } from '@/types/normalized';
import { type Alert, AlertSchema } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
import { normalizeString } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AlertListContextState {
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
		isLoading: boolean
	}
}

/* * */

const AlertListContext = createContext<AlertListContextState | undefined>(undefined);

export const useAlertListContext = () => {
	const context = useContext(AlertListContext);
	if (!context) {
		throw new Error('useAlertListContext must be used within an AlertListContextProvider');
	}
	return context;
};

/* * */

export const AlertListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterPublishStatus, setFilterPublishStatus] = useQueryState<string[]>('publish_status', parseAsArrayOfStrings.withDefault(AlertSchema.shape.publish_status.options));
	const [filterCause, setFilterCause] = useQueryState<string[]>('cause', parseAsArrayOfStrings.withDefault(AlertSchema.shape.cause.options));
	const [filterEffect, setFilterEffect] = useQueryState<string[]>('effect', parseAsArrayOfStrings.withDefault(AlertSchema.shape.effect.options));
	const [filterMunicipality, setFilterMunicipality] = useQueryState<string[]>('municipality', parseAsArrayOfStrings.withDefault(locationsContext.data.municipality_ids));

	//
	// B. Fetch data

	const { data: allAlertsData, error: allAlertsError, isLoading: allAlertsLoading } = useSWR<Alert[], Error>('/api/alerts', swrFetcher);

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
		debounce: 500,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const publishStatusSet = new Set(filterPublishStatus);
		const causeSet = new Set(filterCause);
		const effectSet = new Set(filterEffect);
		const municipalitySet = new Set(filterMunicipality);
		return searchResultsData.filter((alert: AlertNormalized) => {
			// Filter by publish_status
			if (!publishStatusSet.has(alert.publish_status)) return false;
			// Filter by cause
			if (!causeSet.has(alert.cause)) return false;
			// Filter by effect
			if (!effectSet.has(alert.effect)) return false;
			// Filter by municipality
			if (!alert.municipality_ids.some((mId: string) => municipalitySet.has(mId))) return false;
			// Return true if all filters pass
			return true;
		});
	}, [searchResultsData, filterPublishStatus, filterCause, filterEffect, filterMunicipality]);

	//
	// d. Define context value

	const contextValue: AlertListContextState = useMemo(() => ({
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
			isLoading: allAlertsLoading,
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
		<AlertListContext.Provider value={contextValue}>
			{children}
		</AlertListContext.Provider>
	);

	//
};
