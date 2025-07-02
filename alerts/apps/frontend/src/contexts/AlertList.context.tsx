/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { swrFetcher } from '@/lib/http';
import { toggleArray } from '@/lib/utils';
import { type Municipality } from '@carrismetropolitana/api-types/locations';
import { type Line, type Stop } from '@carrismetropolitana/api-types/network';
import { type Alert, AlertSchema } from '@tmlmobilidade/types';
import { useSearchQuery } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { DateTime } from 'luxon';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AlertListContextState {
	actions: {
		changePublishDateEnd: (date: null | string) => void
		changePublishDateStart: (date: null | string) => void
		changeSearchQuery: (query: string) => void
		changeValidityDateEnd: (date: null | string) => void
		changeValidityDateStart: (date: null | string) => void
		toggleCause: (cause: string) => void
		toggleEffect: (effect: string) => void
		toggleLine: (line: string) => void
		toggleMunicipality: (municipality: string) => void
		togglePublishStatus: (status: string) => void
		toggleStop: (stop: string) => void
	}
	data: {
		filtered: Alert[]
		raw: Alert[]
	}
	filters: {
		cause: string[]
		effect: string[]
		line: string[]
		lineOptions: string[]
		municipality: string[]
		municipalityOptions: string[]
		publish_status: string[]
		publishDateEnd: null | string
		publishDateStart: null | string
		searchQuery: string
		stop: string[]
		stopOptions: string[]
		validityDateEnd: null | string
		validityDateStart: null | string
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

export const AlertListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	const [paramSearch, setParamSearch] = useQueryState('query');
	const [filterPublishStatus, setFilterPublishStatus] = useQueryState<string[]>(
		'publishStatus',
		{
			defaultValue: AlertSchema.shape.publish_status.options,
			parse: value => (typeof value === 'string' ? value.split(',').filter(Boolean) : []),
			serialize: value => (Array.isArray(value) ? value.join(',') : ''),
		},
	);
	const [filterCause, setFilterCause] = useQueryState<string[]>(
		'Cause',
		{
			defaultValue: AlertSchema.shape.cause.options,
			parse: value => (typeof value === 'string' ? value.split(',').filter(Boolean) : []),
			serialize: value => (Array.isArray(value) ? value.join(',') : ''),
		},
	);
	const [filterEffect, setFilterEffect] = useQueryState<string[]>(
		'Effect',
		{
			defaultValue: AlertSchema.shape.effect.options,
			parse: value => (typeof value === 'string' ? value.split(',').filter(Boolean) : []),
			serialize: value => (Array.isArray(value) ? value.join(',') : ''),
		},
	);
	const [filterMunicipality, setFilterMunicipality] = useQueryState<string[]>(
		'Municipality',
		{
			defaultValue: [''],
			parse: value => (typeof value === 'string' ? value.split(',').filter(Boolean) : []),
			serialize: value => (Array.isArray(value) ? value.join(',') : ''),
		},
	);
	const [filterLine, setFilterLine] = useQueryState<string[]>(
		'Line',
		{
			defaultValue: [''],
			parse: value => (typeof value === 'string' ? value.split(',').filter(Boolean) : []),
			serialize: value => (Array.isArray(value) ? value.join(',') : ''),
		},
	);
	const [filterStop, setFilterStop] = useQueryState<string[]>(
		'Stop',
		{
			defaultValue: [''],
			parse: value => (typeof value === 'string' ? value.split(',').filter(Boolean) : []),
			serialize: value => (Array.isArray(value) ? value.join(',') : ''),
		},
	);
	const [filterValidityDateStart, setFilterValidityDateStart] = useQueryState<null | string>(
		'Validity-Data-Start',
		{
			defaultValue: null,
			parse: value => (typeof value === 'string' ? value : null),
			serialize: value => (value === '' ? value : null),
		},
	);
	const [filterValidityDateEnd, setFilterValidityDateEnd] = useQueryState<null | string>(
		'Validity-Data-End',
		{
			defaultValue: null,
			parse: value => (typeof value === 'string' ? value : null),
			serialize: value => (value === '' ? value : null),
		},
	);
	const [filterPublishDateStart, setFilterPublishDateStart] = useQueryState<null | string>(
		'Data-Start',
		{
			defaultValue: null,
			parse: value => (typeof value === 'string' ? value : null),
			serialize: value => (value === '' ? value : null),
		},
	);
	const [filterPublishDateEnd, setFilterPublishDateEnd] = useQueryState<null | string>(
		'Data-Start',
		{
			defaultValue: null,
			parse: value => (typeof value === 'string' ? value : null),
			serialize: value => (value === '' ? value : null),
		},
	);

	//
	// B. Fetch data

	const { data: allAlertsData, error: allAlertsError, isLoading: allAlertsLoading } = useSWR<Alert[], Error>('/api/alerts', swrFetcher);

	//
	// C. Transform data

	const rawAlerts = useMemo(() => {
		return allAlertsData || [];
	}, [allAlertsData]);

	const municipalityOptions = useMemo(() => {
		const options = new Set<string>();
		rawAlerts.forEach((alert) => {
			alert.municipality_ids.forEach((id) => {
				const municipality = locationsContext.data.municipalities.find(m => m.id === id);
				if (municipality) {
					options.add(municipality.id);
				}
			});
		});
		setFilterMunicipality(Array.from(options));
		return Array.from(options);
	}, [rawAlerts]);

	const lineOptions = useMemo(() => {
		const options = new Set<string>();
		rawAlerts.forEach((alert) => {
			getAvailableLines(alert).forEach((line_id) => {
				const line = linesContext.data.lines.find(l => l.id === line_id);
				if (line) {
					options.add(line.id);
				}
			});
		});
		setFilterLine(Array.from(options));
		return Array.from(options);
	}, [rawAlerts]);

	const stopOptions = useMemo(() => {
		const options = new Set<string>();
		rawAlerts.forEach((alert) => {
			getAvailableStops(alert).forEach((stop_id) => {
				const stop = stopsContext.data.stops.find(s => s.id === stop_id);
				if (stop) {
					options.add(stop.id);
				}
			});
		});
		setFilterStop(Array.from(options));
		return Array.from(options);
	}, [rawAlerts]);

	/**
	 * Precomputes and normalizes data for alerts, municipalities, stops, and lines.
	 *
	 * @param {Alert[]} records - The list of alert records to be normalized.
	 * @param {Municipality[]} municipalities - The list of municipalities to create a lookup map.
	 * @param {Stop[]} stops - The list of stops to create a lookup map.
	 * @param {Line[]} lines - The list of lines to create a lookup map.
	 * @returns {Object} An object containing normalized records and lookup maps for municipalities, stops, and lines.
	 */
	function precomputeData(records: Alert[], municipalities: Municipality[], stops: Stop[], lines: Line[]) {
		// Normalize record fields
		const normalizedRecords = records.map((record: Alert) => {
			const normalized: Alert = { ...record };
			(['title', 'description', 'cause', 'effect'] as (keyof Alert)[]).forEach((field) => {
				if (record[field]) {
					// @ts-expect-error - TODO: fix this
					normalized[field] = record[field]
						.toString()
						.toLowerCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '');
				}
			});
			return normalized;
		});

		// Create lookup maps for related data
		const municipalityMap = new Map(
			municipalities.map((m: Municipality) => [
				m.id,
				m.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
			]),
		);

		const stopMap = new Map(
			stops.map((s: Stop) => [
				s.id,
				{
					id: s.id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
					name: s.long_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
				},
			]),
		);

		const lineMap = new Map(
			lines.map((l: Line) => [
				l.id,
				{
					id: l.id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
					name: l.long_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
				},
			]),
		);

		return { lineMap, municipalityMap, normalizedRecords, stopMap };
	}

	const { lineMap, municipalityMap, normalizedRecords, stopMap } = useMemo(
		() => precomputeData(rawAlerts, locationsContext.data.municipalities as Municipality[], stopsContext.data.stops as Stop[], linesContext.data.lines as Line[]),
		[rawAlerts, locationsContext.data.municipalities, stopsContext.data.stops, linesContext.data.lines],
	);

	/**
	 * Custom search function that checks if any of the alert's related data matches the query.
	 * @param {Alert} alert - The alert object to search within.
	 * @param {string} query - The search query string.
	 * @returns {boolean} True if any related data matches the query, false otherwise.
	 */
	const customSearch = (alert: Alert, query: string) => {
		// === Municipality ===
		// Search by name
		const municipalityMatch = alert.municipality_ids.some((id) => {
			const normalizedName = municipalityMap.get(id);
			return normalizedName && normalizedName.includes(query);
		});

		// === Stop ===
		// Search by name
		const stopMatch = getAvailableStops(alert).some((stop_id) => {
			const stop = stopMap.get(stop_id);
			return stop && stop.name.includes(query);
		});
		// Search by id
		const stopIdMatch = getAvailableStops(alert).some((stop_id) => {
			const stop = stopMap.get(stop_id);
			return stop && stop.id.includes(query);
		});

		// === Line ===
		// Search by name
		const lineMatch = getAvailableLines(alert).some((line_id) => {
			const line = lineMap.get(line_id);
			return line && line.name.includes(query);
		});
		// Search by id
		const lineIdMatch = getAvailableLines(alert).some((line_id) => {
			const line = lineMap.get(line_id);
			return line && line.id.includes(query);
		});
		return municipalityMatch || stopMatch || stopIdMatch || lineMatch || lineIdMatch;
	};

	// Use the useSearchQuery hook
	const { filteredData: searchFilteredAlerts, searchQuery, setSearchQuery } = useSearchQuery<any>(normalizedRecords, {
		accessors: ['title', 'description', 'cause', 'effect', 'municipality_ids'],
		customSearch,
		debounce: 500,
	});

	// Sets URL Params
	useEffect(() => {
		if (paramSearch != searchQuery)
			setParamSearch(searchQuery);
	}, [searchQuery]);

	// Sets initial params in useQuerySearchHook
	useEffect(() => {
		if (!paramSearch) return;

		setSearchQuery(paramSearch);
	}, []);

	const filteredAlerts = useMemo(() => {
		// Quick exits if there's no data
		if (!searchFilteredAlerts?.length) {
			return [];
		}

		// 1. Convert filter arrays to sets for O(1) membership checks
		const publishStatusSet = new Set(filterPublishStatus);
		const causeSet = new Set(filterCause);
		const effectSet = new Set(filterEffect);
		const municipalitySet = new Set(filterMunicipality);
		const lineSet = new Set(filterLine);
		const stopSet = new Set(filterStop);

		// 2. Create date boundaries if needed
		const fromPublishStart = filterPublishDateStart ? Dates.fromFormat(filterPublishDateStart, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;
		const fromPublishEnd = filterPublishDateEnd ? Dates.fromFormat(filterPublishDateEnd, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;

		const fromValidityStart = filterValidityDateStart ? Dates.fromFormat(filterValidityDateStart, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;
		const fromValidityEnd = filterValidityDateEnd ? Dates.fromFormat(filterValidityDateEnd, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null;

		// 3. Booleans to see if all possible options are chosen (meaning we skip that filter entirely)
		const allPublishStatuses = filterPublishStatus.length === AlertSchema.shape.publish_status.options.length;
		const allCauses = filterCause.length === AlertSchema.shape.cause.options.length;
		const allEffects = filterEffect.length === AlertSchema.shape.effect.options.length;
		const allMunicipalities = filterMunicipality.length === municipalityOptions.length;
		const allLines = filterLine.length === lineOptions.length;
		const allStops = filterStop.length === stopOptions.length;

		// 4. Single-pass filter
		return searchFilteredAlerts.filter((alert) => {
			// 4.1 Publish status
			if (!allPublishStatuses && !publishStatusSet.has(alert.publish_status)) {
				return false;
			}

			// 4.2 Cause
			if (!allCauses && !causeSet.has(alert.cause)) {
				return false;
			}

			// 4.3 Effect
			if (!allEffects && !effectSet.has(alert.effect)) {
				return false;
			}

			// 4.4 Municipality
			if (!allMunicipalities) {
				// Check if there's any overlap between the alert's municipality_ids and our municipalitySet
				const hasAnyMunicipality = alert.municipality_ids.some((mId: string) => municipalitySet.has(mId));
				if (!hasAnyMunicipality) {
					return false;
				}
			}

			// 4.5 Lines
			if (!allLines) {
				// Pre-fetch line IDs for this alert once
				const alertLineIds = getAvailableLines(alert);
				const intersectsLine = alertLineIds.some(lId => lineSet.has(lId));
				if (!intersectsLine) {
					return false;
				}
			}

			// 4.6 Stops
			if (!allStops) {
				// Pre-fetch stop IDs for this alert once
				const alertStopIds = getAvailableStops(alert);
				const intersectsStop = alertStopIds.some(sId => stopSet.has(sId));
				if (!intersectsStop) {
					return false;
				}
			}

			// 4.7 Publish date
			if (fromPublishStart || fromPublishEnd) {
				const alertPublishStart = DateTime.fromISO(alert.publish_start_date.toString()).toMillis();
				const alertPublishEnd = DateTime.fromISO(alert.publish_end_date?.toString() || '').toMillis();

				// If both start and end are defined
				if (fromPublishStart && fromPublishEnd) {
					if (alertPublishStart < fromPublishStart || alertPublishEnd > fromPublishEnd) {
						return false;
					}
				}
				else if (fromPublishStart && alertPublishStart < fromPublishStart) {
					return false;
				}
				else if (fromPublishEnd && alertPublishEnd > fromPublishEnd) {
					return false;
				}
			}

			// 4.8 Validity date
			if (fromValidityStart || fromValidityEnd) {
				const alertValidityStart = DateTime.fromISO(alert.active_period_start_date.toString()).toMillis();
				const alertValidityEnd = DateTime.fromISO(alert.active_period_end_date?.toString() || '').toMillis();

				// If both start and end are defined
				if (fromValidityStart && fromValidityEnd) {
					if (alertValidityStart < fromValidityStart || alertValidityEnd > fromValidityEnd) {
						return false;
					}
				}
				else if (fromValidityStart && alertValidityStart < fromValidityStart) {
					return false;
				}
				else if (fromValidityEnd && alertValidityEnd > fromValidityEnd) {
					return false;
				}
			}

			return true;
		});
	}, [
		searchFilteredAlerts,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		filterLine,
		filterStop,
		filterValidityDateStart,
		filterValidityDateEnd,
		filterPublishDateStart,
		filterPublishDateEnd,
		municipalityOptions,
		lineOptions,
		stopOptions,
	]);

	//
	// D. Handle actions

	function handleTogglePublishStatus(status: string) {
		setFilterPublishStatus(toggleArray(filterPublishStatus, status));
	}

	function handleToggleCause(cause: string) {
		setFilterCause(toggleArray(filterCause, cause));
	}

	function handleToggleEffect(effect: string) {
		setFilterEffect(toggleArray(filterEffect, effect));
	}

	function handleToggleMunicipality(municipality: string) {
		setFilterMunicipality(toggleArray(filterMunicipality, municipality));
	}

	function handleToggleLine(route_id: string) {
		setFilterLine(toggleArray(filterLine, route_id));
	}

	function handleToggleStop(stop_id: string) {
		setFilterStop(toggleArray(filterStop, stop_id));
	}

	function handleChangeValidityDateStart(date: null | string) {
		setFilterValidityDateStart(date);
	}

	function handleChangeValidityDateEnd(date: null | string) {
		setFilterValidityDateEnd(date);
	}

	function handleChangePublishDateStart(date: null | string) {
		setFilterPublishDateStart(date);
	}

	function handleChangePublishDateEnd(date: null | string) {
		setFilterPublishDateEnd(date);
	}

	//
	// E. Define context value

	const contextValue: AlertListContextState = useMemo(() => ({
		actions: {
			changePublishDateEnd: handleChangePublishDateEnd,
			changePublishDateStart: handleChangePublishDateStart,
			changeSearchQuery: setSearchQuery,
			changeValidityDateEnd: handleChangeValidityDateEnd,
			changeValidityDateStart: handleChangeValidityDateStart,
			toggleCause: handleToggleCause,
			toggleEffect: handleToggleEffect,
			toggleLine: handleToggleLine,
			toggleMunicipality: handleToggleMunicipality,
			togglePublishStatus: handleTogglePublishStatus,
			toggleStop: handleToggleStop,
		},
		data: {
			filtered: filteredAlerts || [],
			raw: rawAlerts || [],
		},
		filters: {
			cause: filterCause,
			effect: filterEffect,
			line: filterLine,
			lineOptions: lineOptions,
			municipality: filterMunicipality,
			municipalityOptions: municipalityOptions,
			publish_status: filterPublishStatus,
			publishDateEnd: filterPublishDateEnd,
			publishDateStart: filterPublishDateStart,
			searchQuery: searchQuery || '',
			stop: filterStop,
			stopOptions: stopOptions,
			validityDateEnd: filterValidityDateEnd,
			validityDateStart: filterValidityDateStart,
		},
		flags: {
			error: allAlertsError,
			isLoading: allAlertsLoading,
		},
	}), [
		rawAlerts,
		filteredAlerts,
		allAlertsData,
		allAlertsLoading,
		allAlertsError,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		municipalityOptions,
		filterLine,
		lineOptions,
		filterStop,
		stopOptions,
		filterValidityDateStart,
		filterValidityDateEnd,
		filterPublishDateStart,
		filterPublishDateEnd,
		searchQuery,
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
