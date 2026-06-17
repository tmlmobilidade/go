'use client';

import { type AlertNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Alert, AlertReferenceTypeSchema, AlertSchema, PermissionCatalog, PublishStatusSchema } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, parseAsInteger, useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, UseFilterStateDateReturnType, useLocationsContext, useQueryState, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

interface AlertsListContextState extends ListContextStateTemplate {

	data: {
		filtered: Alert[]
		raw: Alert[]
	}
	filters: ListContextStateTemplate['filters'] & {
		agency: UseFilterStateListReturnType
		cause: UseFilterStateListReturnType
		date_creation: number
		date_creation_limit: number
		date_end: number
		date_start: number
		effect: UseFilterStateListReturnType
		municipality: UseFilterStateListReturnType
		publish_status: UseFilterStateListReturnType
		reference_type: UseFilterStateListReturnType
	}
}

/* * */

const AlertsListContext = createContext<AlertsListContextState | undefined>(undefined);

export const useAlertsListContext = () => {
	const context = useContext(AlertsListContext);
	if (!context) {
		throw new Error('useAlertsListContext must be used within an AlertsListContextProvider');
	}
	return context;
};

/* * */

export function AlertsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const locationsContext = useLocationsContext();

	//
	// B. Fetch data

	const { data: allScheduledData, error: allScheduledError, isLoading: allScheduledLoading, isValidating: allScheduledValidating } = useSWR<Alert[], Error>(API_ROUTES.alerts.ALERTS_LIST);

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.read],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// C. Setup filters

	const [filterDateEnd, setFilterDateEnd] = useQueryState<number>('date_end', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').plus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDateStart, setFilterDateStart] = useQueryState<number>('date_start', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp, [])));
	const [filterCreationStart, setFilterDateCreationStart] = useQueryState<number>('date_creation_start', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').unix_timestamp, [])));
	const filterCreationEnd = UseFilterStateDate ('date_creation_end',defaultCreation;

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
	const filterAlertReferenceType = useFilterStateList('reference_type', AlertReferenceTypeSchema.options, AlertReferenceTypeSchema.options.map(item => ({ label: t(`shared:alerts.reference_types.${item}.title`), value: item })));
	const filterPublishStatus = useFilterStateList('publish_status', PublishStatusSchema.options, PublishStatusSchema.options.map(item => ({ label: t(`shared:status.publish_status.${item}`), value: item })));
	const filterCause = useFilterStateList('cause', AlertSchema.shape.cause.options, AlertSchema.shape.cause.options.map(item => ({ label: t(`shared:alerts.causes.${item}.title`), value: item })));
	const filterEffect = useFilterStateList('effect', AlertSchema.shape.effect.options, AlertSchema.shape.effect.options.map(item => ({ label: t(`shared:alerts.effects.${item}.title`), value: item })));
	const filterMunicipality = useFilterStateList('municipality', locationsContext.data.municipality_ids, locationsContext.data.municipalities.map(item => ({ label: item.name, value: item.id })));

	//
	// D. Transform data

	const normalizedAlertsData: AlertNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allScheduledData) return [];
		// Normalize record fields
		return allScheduledData.map(item => ({
			...item,
			description_normalized: normalizeString(item.description),
			title_normalized: normalizeString(item.title),
		}));
	}, [allScheduledData]);

	const searchResultsData = useSearch<AlertNormalized>({
		accessors: ['_id', 'title_normalized', 'description_normalized'],
		data: normalizedAlertsData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// Skip if no query filters are set
		if (filterPublishStatus.value.length === 0 && filterCause.value.length === 0 && filterEffect.value.length === 0 && filterMunicipality.value.length === 0) return searchResultsData;
		// Filter by query filters
		const result = searchResultsData.filter((alert: AlertNormalized) => {
			// Filter by agency IDs
			if (!filterAgency.value.includes(alert.agency_id)) return false;
			// Filter by reference type
			if (!filterAlertReferenceType.value.includes(alert.reference_type)) return false;
			// Filter by publish_status
			if (!filterPublishStatus.value.includes(alert.publish_status)) return false;
			// Filter by cause
			if (!filterCause.value.includes(alert.cause)) return false;
			// Filter by effect
			if (!filterEffect.value.includes(alert.effect)) return false;
			// Filter by municipality IDs
			// if (!alert.municipality_ids.some((mId: string) => filterMunicipality.value.includes(mId))) return false;
			//
			// Filter by time started and time ended
			if ((alert.active_period_start_date ?? 0) > filterDateEnd || (alert.active_period_end_date ?? Infinity) < filterDateStart) return false;
			// Filter by time created
			if (filterCreationStart && (alert.created_at ?? 0) < filterCreationStart) return false;
			if (filterCreationEnd && (alert.created_at ?? 0) > filterCreationEnd) return false;

			// Return true if all filters pass
			return true;
		});

		// Sort by creation date (newest first)
		return result.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
	}, [
		searchResultsData,
		filterAgency.value,
		filterAlertReferenceType.value,
		filterPublishStatus.value,
		filterCause.value,
		filterEffect.value,
		filterMunicipality.value,
		filterDateEnd,
		filterDateStart,
		filterCreationStart,
		filterCreationEnd,
	]);

	//
	// E. Define context value

	const contextValue: AlertsListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData ?? [],
			raw: allScheduledData,
		},
		filters: {
			agency: filterAgency,
			cause: filterCause,
			date_creation: filterCreationStart,
			date_creation_limit: filterCreationEnd,
			date_end: filterDateEnd,
			date_start: filterDateStart,
			effect: filterEffect,
			municipality: filterMunicipality,
			publish_status: filterPublishStatus,
			reference_type: filterAlertReferenceType,
			search: filterSearch,
		},
		flags: {
			error: allScheduledError,
			isLoading: allScheduledLoading,
			isValidating: allScheduledValidating,
		},
	}), [
		allScheduledData,
		filterDateEnd,
		filterDateStart,
		filterCreationStart,
		filterCreationEnd,
		filterResultsData,
		allScheduledLoading,
		allScheduledValidating,
		filterAlertReferenceType,
		filterAgency,
		allScheduledError,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		filterSearch,
	]);

	//
	// F. Render components

	return (
		<AlertsListContext.Provider value={contextValue}>
			{children}
		</AlertsListContext.Provider>
	);

	//
};
