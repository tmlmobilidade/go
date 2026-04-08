'use client';

/* * */

import { type AlertNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Alert, AlertReferenceTypeSchema, AlertSchema, PublishStatusSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useLocationsContext, useSearch } from '@tmlmobilidade/ui';
import { parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

interface AlertsPublicListContextState {
	data: {
		filtered: Alert[]
		raw: Alert[]
	}
	filters: {
		// agency: UseFilterStateListReturnType
		cause: UseFilterStateListReturnType
		effect: UseFilterStateListReturnType
		municipality: UseFilterStateListReturnType
		publish_status: UseFilterStateListReturnType
		reference_type: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
		setSince: (value: null | number) => Promise<URLSearchParams>
		setUntil: (value: null | number) => Promise<URLSearchParams>
		since: UnixTimestamp
		until: UnixTimestamp
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const AlertsPublicListContext = createContext<AlertsPublicListContextState | undefined>(undefined);

export const useAlertsPublicListContext = () => {
	const context = useContext(AlertsPublicListContext);
	if (!context) {
		throw new Error('useAlertsPublicListContext must be used within an AlertsPublicListContextProvider');
	}
	return context;
};

/* * */

export const AlertsPublicListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const locationsContext = useLocationsContext();

	//
	// B. Fetch data

	const { data: allScheduledData, error: allScheduledError, isLoading: allScheduledLoading } = useSWR<Alert[], Error>(API_ROUTES.alerts.ALERTS_LIST_PUBLIC);

	// const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
	// 	actions: [PermissionCatalog.all.alerts.actions.read],
	// 	scope: PermissionCatalog.all.alerts.scope,
	// });

	//
	// C. Setup filters

	const filterSearch = useFilterStateString('search');
	const defaultSince = useMemo(() => Dates.now('Europe/Lisbon').startOf('day').unix_timestamp, []);
	const defaultUntil = useMemo(() => Dates.now('Europe/Lisbon').plus({ years: 1 }).endOf('day').unix_timestamp, []);
	const [filterSince, setFilterSince] = useQueryState<number>('since', parseAsInteger.withDefault(defaultSince));
	const [filterUntil, setFilterUntil] = useQueryState<number>('until', parseAsInteger.withDefault(defaultUntil));
	// const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
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
		const [windowStart, windowEnd] = filterSince <= filterUntil
			? [filterSince, filterUntil]
			: [filterUntil, filterSince];
		// Filter by query filters
		const result = searchResultsData.filter((alert: AlertNormalized) => {
			// Filter by agency IDs
			// if (!filterAgency.value.includes(alert.agency_id)) return false;
			// Filter by reference type
			if (!filterAlertReferenceType.value.includes(alert.reference_type)) return false;
			// Filter by publish_status
			if (!filterPublishStatus.value.includes(alert.publish_status)) return false;
			// Filter by cause
			if (!filterCause.value.includes(alert.cause)) return false;
			// Filter by effect
			if (!filterEffect.value.includes(alert.effect)) return false;
			// Filter by municipality IDs
			if (!alert.municipality_ids.some((mId: string) => filterMunicipality.value.includes(mId))) return false;
			// Filter by active period overlap
			if (alert.active_period_start_date > windowEnd) return false;
			const activePeriodEnd = alert.active_period_end_date ?? Number.MAX_SAFE_INTEGER;
			if (activePeriodEnd < windowStart) return false;
			// Return true if all filters pass
			return true;
		});

		// Sort by creation date (newest first)
		return result.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
	}, [
		searchResultsData,
		// filterAgency.value,
		filterAlertReferenceType.value,
		filterPublishStatus.value,
		filterCause.value,
		filterEffect.value,
		filterMunicipality.value,
		filterSince,
		filterUntil,
	]);

	//
	// E. Define context value

	const contextValue: AlertsPublicListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData ?? [],
			raw: allScheduledData,
		},
		filters: {
			// agency: filterAgency,
			cause: filterCause,
			effect: filterEffect,
			municipality: filterMunicipality,
			publish_status: filterPublishStatus,
			reference_type: filterAlertReferenceType,
			search: filterSearch,
			setSince: setFilterSince,
			setUntil: setFilterUntil,
			since: filterSince as UnixTimestamp,
			until: filterUntil as UnixTimestamp,
		},
		flags: {
			error: allScheduledError,
			loading: allScheduledLoading,
		},
	}), [
		allScheduledData,
		filterResultsData,
		allScheduledLoading,
		filterAlertReferenceType,
		// filterAgency,
		allScheduledError,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		filterSearch,
		filterSince,
		filterUntil,
		setFilterSince,
		setFilterUntil,
	]);

	//
	// F. Render components

	return (
		<AlertsPublicListContext.Provider value={contextValue}>
			{children}
		</AlertsPublicListContext.Provider>
	);

	//
};
