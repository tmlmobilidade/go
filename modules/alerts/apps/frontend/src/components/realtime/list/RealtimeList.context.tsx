'use client';

/* * */

import { type AlertNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Alert, AlertSchema, PermissionCatalog, PublishStatusSchema } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useLocationsContext, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RealtimeListContextState {
	data: {
		filtered: Alert[]
		raw: Alert[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		cause: UseFilterStateListReturnType
		effect: UseFilterStateListReturnType
		municipality: UseFilterStateListReturnType
		publish_status: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const RealtimeListContext = createContext<RealtimeListContextState | undefined>(undefined);

export const useRealtimeListContext = () => {
	const context = useContext(RealtimeListContext);
	if (!context) {
		throw new Error('useRealtimeListContext must be used within an RealtimeListContextProvider');
	}
	return context;
};

/* * */

export const RealtimeListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Fetch data

	const { data: allAlertsRealtimeData, error: allAlertsRealtimeError, isLoading: allAlertsRealtimeLoading } = useSWR<Alert[], Error>(API_ROUTES.alerts.REALTIME_LIST);

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(PermissionCatalog.all.alerts_realtime.scope, PermissionCatalog.all.alerts_realtime.actions.read);

	//
	// C. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
	const filterPublishStatus = useFilterStateList('publish_status', PublishStatusSchema.options, PublishStatusSchema.options.map(item => ({ label: item, value: item })));
	const filterCause = useFilterStateList('cause', AlertSchema.shape.cause.options, AlertSchema.shape.cause.options.map(item => ({ label: item, value: item })));
	const filterEffect = useFilterStateList('effect', AlertSchema.shape.effect.options, AlertSchema.shape.effect.options.map(item => ({ label: item, value: item })));
	const filterMunicipality = useFilterStateList('municipality', locationsContext.data.municipality_ids, locationsContext.data.municipalities.map(item => ({ label: item.name, value: item.id })));

	//
	// D. Transform data

	const normalizedAlertsData: AlertNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allAlertsRealtimeData) return [];
		// Normalize record fields
		return allAlertsRealtimeData.map(item => ({
			...item,
			description_normalized: normalizeString(item.description),
			title_normalized: normalizeString(item.title),
		}));
	}, [allAlertsRealtimeData]);

	const searchResultsData = useSearch<AlertNormalized>({
		accessors: ['title_normalized', 'description_normalized'],
		data: normalizedAlertsData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// Skip if no query filters are set
		if (filterPublishStatus.value.length === 0 && filterCause.value.length === 0 && filterEffect.value.length === 0 && filterMunicipality.value.length === 0) return searchResultsData;
		// 1. Convert filter arrays to sets for O(1) membership checks
		const filterPublishStatusSet = new Set(filterPublishStatus.value);
		const filterCauseSet = new Set(filterCause.value);
		const filterEffectSet = new Set(filterEffect.value);
		const filterMunicipalitySet = new Set(filterMunicipality.value);
		// 2. Filter by query filters
		return searchResultsData.filter((alert: AlertNormalized) => {
			// Filter by agency IDs
			if (!alert.agency_ids?.some((aId: string) => filterAgency.value.includes(aId))) return false;
			// Filter by publish_status
			if (!filterPublishStatusSet.has(alert.publish_status)) return false;
			// Filter by cause
			if (!filterCauseSet.has(alert.cause)) return false;
			// Filter by effect
			if (!filterEffectSet.has(alert.effect)) return false;
			// Filter by municipality IDs
			if (!alert.municipality_ids.some((mId: string) => filterMunicipalitySet.has(mId))) return false;
			// Return true if all filters pass
			return true;
		});
	}, [
		searchResultsData,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterAgency,
		filterMunicipality,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
	]);

	//
	// E. Define context value

	const contextValue: RealtimeListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allAlertsRealtimeData,
		},
		filters: {
			agency: filterAgency,
			cause: filterCause,
			effect: filterEffect,
			municipality: filterMunicipality,
			publish_status: filterPublishStatus,
			search: filterSearch,
		},
		flags: {
			error: allAlertsRealtimeError,
			loading: allAlertsRealtimeLoading,
		},
	}), [
		allAlertsRealtimeData,
		filterResultsData,
		allAlertsRealtimeLoading,
		filterAgency,
		allAlertsRealtimeError,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		filterSearch,
	]);

	//
	// F. Render components

	return (
		<RealtimeListContext.Provider value={contextValue}>
			{children}
		</RealtimeListContext.Provider>
	);

	//
};
