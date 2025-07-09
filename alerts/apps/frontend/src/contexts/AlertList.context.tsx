'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { swrFetcher } from '@/lib/http';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { type Alert, AlertSchema } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
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

	/**
	 * Precomputes and normalizes data for alerts, municipalities, stops, and lines.
	 * @param records The list of alert records to be normalized.
	 * @param municipalities The list of municipalities to create a lookup map.
	 * @param stops The list of stops to create a lookup map.
	 * @param lines The list of lines to create a lookup map.
	 * @returns An object containing normalized records and lookup maps for municipalities, stops, and lines.
	 */
	// function precomputeData(records: Alert[], municipalities: Municipality[], stops: Stop[], lines: Line[]) {
	// 	// Normalize record fields
	// 	const normalizedRecords = records.map((record: Alert) => {
	// 		const normalized: Alert = { ...record };
	// 		(['title', 'description', 'cause', 'effect'] as (keyof Alert)[]).forEach((field) => {
	// 			if (record[field]) {
	// 				// @ts-expect-error - TODO: fix this
	// 				normalized[field] = record[field]
	// 					.toString()
	// 					.toLowerCase()
	// 					.normalize('NFD')
	// 					.replace(/[\u0300-\u036f]/g, '');
	// 			}
	// 		});
	// 		return normalized;
	// 	});

	// 	// Create lookup maps for related data
	// 	const municipalityMap = new Map(
	// 		municipalities.map((m: Municipality) => [
	// 			m.id,
	// 			m.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
	// 		]),
	// 	);

	// 	const stopMap = new Map(
	// 		stops.map((s: Stop) => [
	// 			s.id,
	// 			{
	// 				id: s.id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
	// 				name: s.long_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
	// 			},
	// 		]),
	// 	);

	// 	const lineMap = new Map(
	// 		lines.map((l: Line) => [
	// 			l.id,
	// 			{
	// 				id: l.id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
	// 				name: l.long_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
	// 			},
	// 		]),
	// 	);

	// 	return { lineMap, municipalityMap, normalizedRecords, stopMap };
	// }

	// const { lineMap, municipalityMap, normalizedRecords, stopMap } = useMemo(() => {
	// 	return precomputeData(allAlertsData ?? [], locationsContext.data.municipalities as Municipality[], stopsContext.data.stops as Stop[], linesContext.data.lines as Line[]);
	// }, [allAlertsData, locationsContext.data.municipalities, stopsContext.data.stops, linesContext.data.lines]);

	/**
	 * Custom search function that checks if any of the alert's related data matches the query.
	 * @param alert The alert object to search within.
	 * @param query The search query string.
	 * @returns True if any related data matches the query, false otherwise.
	 */
	// const customSearch = (alert: Alert, query: string) => {
	// 	// === Municipality ===
	// 	// Search by name
	// 	const municipalityMatch = alert.municipality_ids.some((id) => {
	// 		const normalizedName = municipalityMap.get(id);
	// 		return normalizedName && normalizedName.includes(query);
	// 	});

	// 	// === Stop ===
	// 	// Search by name
	// 	const stopMatch = getAvailableStops(alert).some((stop_id) => {
	// 		const stop = stopMap.get(stop_id);
	// 		return stop && stop.name.includes(query);
	// 	});
	// 	// Search by id
	// 	const stopIdMatch = getAvailableStops(alert).some((stop_id) => {
	// 		const stop = stopMap.get(stop_id);
	// 		return stop && stop.id.includes(query);
	// 	});

	// 	// === Line ===
	// 	// Search by name
	// 	const lineMatch = getAvailableLines(alert).some((line_id) => {
	// 		const line = lineMap.get(line_id);
	// 		return line && line.name.includes(query);
	// 	});

	// 	// Search by id
	// 	const lineIdMatch = getAvailableLines(alert).some((line_id) => {
	// 		const line = lineMap.get(line_id);
	// 		return line && line.id.includes(query);
	// 	});
	// 	return municipalityMatch || stopMatch || stopIdMatch || lineMatch || lineIdMatch;
	// };

	// Use the useSearchQuery hook

	const searchFilteredAlerts = useSearch<Alert>({
		accessors: ['title', 'description', 'cause', 'effect', 'municipality_ids'],
		// customSearch,
		data: allAlertsData ?? [],
		debounce: 500,
		query: filterSearch,
	});

	console.log('searchFilteredAlerts', searchFilteredAlerts);

	// const filteredAlerts = useMemo(() => {
	// 	return searchFilteredAlerts;
	// 	// Skip if there are no search results
	// 	if (!searchFilteredAlerts?.length) {
	// 		return [];
	// 	}

	// 	// 1. Convert filter arrays to sets for O(1) membership checks
	// 	const publishStatusSet = new Set(filterPublishStatus);
	// 	const causeSet = new Set(filterCause);
	// 	const effectSet = new Set(filterEffect);
	// 	const municipalitySet = new Set(filterMunicipality);
	// 	const lineSet = new Set(filterLine);
	// 	const stopSet = new Set(filterStop);

	// 	// 2. Create date boundaries if needed
	// 	const fromPublishStart = filterPublishDateStart ? Dates.fromFormat(filterPublishDateStart, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;
	// 	const fromPublishEnd = filterPublishDateEnd ? Dates.fromFormat(filterPublishDateEnd, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;

	// 	const fromValidityStart = filterValidityDateStart ? Dates.fromFormat(filterValidityDateStart, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;
	// 	const fromValidityEnd = filterValidityDateEnd ? Dates.fromFormat(filterValidityDateEnd, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;

	// 	// 3. Booleans to see if all possible options are chosen (meaning we skip that filter entirely)
	// 	const allPublishStatuses = filterPublishStatus.length === AlertSchema.shape.publish_status.options.length;
	// 	const allCauses = filterCause.length === AlertSchema.shape.cause.options.length;
	// 	const allEffects = filterEffect.length === AlertSchema.shape.effect.options.length;
	// 	const allMunicipalities = filterMunicipality.length === filterMunicipality.length;
	// 	const allLines = filterLine.length === lineOptions.length;
	// 	const allStops = filterStop.length === stopOptions.length;

	// 	// 4. Single-pass filter
	// 	return searchFilteredAlerts.filter((alert: Alert) => {
	// 		// return true;
	// 		// 4.1 Publish status
	// 		if (!allPublishStatuses && !publishStatusSet.has(alert.publish_status)) {
	// 			return false;
	// 		}

	// 		// 4.2 Cause
	// 		if (!allCauses && !causeSet.has(alert.cause)) {
	// 			return false;
	// 		}

	// 		// 4.3 Effect
	// 		if (!allEffects && !effectSet.has(alert.effect)) {
	// 			return false;
	// 		}

	// 		// 4.4 Municipality
	// 		if (!allMunicipalities) {
	// 			// Check if there's any overlap between the alert's municipality_ids and our municipalitySet
	// 			const hasAnyMunicipality = alert.municipality_ids.some((mId: string) => municipalitySet.has(mId));
	// 			if (!hasAnyMunicipality) {
	// 				return false;
	// 			}
	// 		}

	// 		// 4.5 Lines
	// 		if (!allLines) {
	// 			// Pre-fetch line IDs for this alert once
	// 			const alertLineIds = getAvailableLines(alert);
	// 			const intersectsLine = alertLineIds.some(lId => lineSet.has(lId));
	// 			if (!intersectsLine) {
	// 				return false;
	// 			}
	// 		}

	// 		// 4.6 Stops
	// 		if (!allStops) {
	// 			// Pre-fetch stop IDs for this alert once
	// 			const alertStopIds = getAvailableStops(alert);
	// 			const intersectsStop = alertStopIds.some(sId => stopSet.has(sId));
	// 			if (!intersectsStop) {
	// 				return false;
	// 			}
	// 		}

	// 		// 4.7 Publish date
	// 		if (fromPublishStart || fromPublishEnd) {
	// 			const alertPublishStart = alert.publish_start_date;
	// 			const alertPublishEnd = alert.publish_end_date;

	// 			// If both start and end are defined
	// 			if (fromPublishStart && fromPublishEnd) {
	// 				if (alertPublishStart < fromPublishStart || alertPublishEnd > fromPublishEnd) {
	// 					return false;
	// 				}
	// 			}
	// 			else if (fromPublishStart && alertPublishStart < fromPublishStart) {
	// 				return false;
	// 			}
	// 			else if (fromPublishEnd && alertPublishEnd > fromPublishEnd) {
	// 				return false;
	// 			}
	// 		}

	// 		// 4.8 Validity date
	// 		if (fromValidityStart || fromValidityEnd) {
	// 			const alertValidityStart = alert.active_period_start_date;
	// 			const alertValidityEnd = alert.active_period_end_date;

	// 			// If both start and end are defined
	// 			if (fromValidityStart && fromValidityEnd) {
	// 				if (alertValidityStart < fromValidityStart || alertValidityEnd > fromValidityEnd) {
	// 					return false;
	// 				}
	// 			}
	// 			else if (fromValidityStart && alertValidityStart < fromValidityStart) {
	// 				return false;
	// 			}
	// 			else if (fromValidityEnd && alertValidityEnd > fromValidityEnd) {
	// 				return false;
	// 			}
	// 		}

	// 		return true;
	// 	});
	// }, [
	// 	searchFilteredAlerts,
	// 	filterPublishStatus,
	// 	filterCause,
	// 	filterEffect,
	// 	filterMunicipality,
	// 	filterLine,
	// 	filterStop,
	// 	filterValidityDateStart,
	// 	filterValidityDateEnd,
	// 	filterPublishDateStart,
	// 	filterPublishDateEnd,
	// 	lineOptions,
	// 	stopOptions,
	// ]);

	//
	// D. Handle actions

	//
	// E. Define context value

	const contextValue: AlertListContextState = useMemo(() => ({
		actions: {
			setFilterCause: setFilterCause,
			setFilterEffect: setFilterEffect,
			setFilterMunicipality: setFilterMunicipality,
			setFilterPublishStatus: setFilterPublishStatus,
			setFilterSearch: setFilterSearch,
		},
		data: {
			filtered: searchFilteredAlerts || [],
			raw: allAlertsData || [],
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
		searchFilteredAlerts,
		allAlertsData,
		allAlertsLoading,
		allAlertsError,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		filterSearch,
	]);

	//
	// F. Render components

	return (
		<AlertListContext.Provider value={contextValue}>
			{children}
		</AlertListContext.Provider>
	);

	//
};
