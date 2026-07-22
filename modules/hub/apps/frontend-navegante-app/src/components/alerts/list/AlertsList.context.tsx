'use client';

import { transformAlertDataIntoGeoJsonFeature, useAlertsContext } from '@/components/alerts/Alerts.context';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubAlert } from '@tmlmobilidade/go-types-public-info';
import { type AlertCause, type AlertEffect } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, type UseFilterStateStringReturnType, useLocalStorage, useQueryState, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

const CM_AGENCY_IDS = new Set(['41', '42', '43', '44']);

/* * */

interface AlertsListContextState extends Omit<ListContextStateTemplate, 'flags'> {
	actions: {
		toggle: (view: 'current' | 'future' | 'map') => void
		updateFilterByCause: (value: AlertCause | null) => void
		updateFilterByEffect: (value: AlertEffect | null) => void
		updateFilterByLineId: (value: string) => void
		updateFilterByStopId: (value: string) => void
	}
	counters: {
		by_date: {
			current: number
			future: number
		}
	}
	data: {
		fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
		filtered: HubAlert[]
		grouped: AlertGroup[]
	}
	filters: {
		agency: UseFilterStateStringReturnType
		cause: AlertCause | null
		effect: AlertEffect | null
		line_id: null | string
		search: UseFilterStateStringReturnType
		stop_id: null | string
	}
	flags: {
		is_loading: boolean
	}
	view: {
		current: 'current' | 'future' | 'map'
	}
}

/* * */

const AlertsListContext = createContext<AlertsListContextState | undefined>(undefined);

export function useAlertsListContext() {
	const context = useContext(AlertsListContext);
	if (!context) {
		throw new Error('useAlertsListContext must be used within a AlertsListContextProvider');
	}
	return context;
}

/* * */

export function AlertsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const alertsContext = useAlertsContext();

	const { i18n, t } = useTranslation();

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateString('agency');

	const [currentView, setCurrentView] = useLocalStorage<'current' | 'future' | 'map'>({ defaultValue: 'current', key: 'alerts-current-view' });
	const [filterByLineIdState, setFilterByLineIdState] = useQueryState('line_id');
	const [filterByStopIdState, setFilterByStopIdState] = useQueryState('stop_id');
	const [filterByCauseState, setFilterByCauseState] = useQueryState('cause', {
		parse: (value: string) => value as AlertCause | null,
		serialize: (value: AlertCause | null) => value as string,
	});
	const [filterByEffectState, setFilterByEffectState] = useQueryState('effect', {
		parse: (value: string) => value as AlertEffect | null,
		serialize: (value: AlertEffect | null) => value as string,
	});

	//
	// B. Transform data

	const oneWeekFromNowMs = useMemo(() => Dates.now('Europe/Lisbon').plus({ weeks: 1 }).endOf('day').unix_timestamp, []);

	const searchResultsData = useSearch<HubAlert>({
		accessors: ['title', 'description'],
		data: alertsContext.data.alerts,
		query: filterSearch.value,
	});

	const baseFilteredData = useMemo(() => {
		if (!filterAgency.value) return (searchResultsData ?? []);
		return (searchResultsData ?? []).filter((alert) => {
			const normalized = CM_AGENCY_IDS.has(alert.agency_id) ? 'CM' : alert.agency_id;
			return normalized === filterAgency.value;
		});
	}, [filterAgency.value, searchResultsData]);

	const nonDateFilteredData = useMemo(() => {
		let result = baseFilteredData;

		if (filterByLineIdState) {
			result = result.filter(alert => alert.references.some(reference => reference.parent_id === filterByLineIdState));
		}

		if (filterByStopIdState) {
			result = result.filter(alert => alert.references.some(reference => reference.child_ids.includes(filterByStopIdState)));
		}

		if (filterByCauseState) {
			result = result.filter(alert => alert.cause === filterByCauseState);
		}

		if (filterByEffectState) {
			result = result.filter(alert => alert.effect === filterByEffectState);
		}

		return result;
	}, [baseFilteredData, filterByLineIdState, filterByStopIdState, filterByCauseState, filterByEffectState]);

	const { currentWeekCount, futureWeekCount } = useMemo(() => {
		let current = 0;
		let future = 0;

		for (const alert of nonDateFilteredData) {
			if (!alert.active_period_start_date) continue;
			if (alert.active_period_start_date <= oneWeekFromNowMs) current++;
			else future++;
		}

		return { currentWeekCount: current, futureWeekCount: future };
	}, [nonDateFilteredData, oneWeekFromNowMs]);

	const filteredAlerts = useMemo(() => {
		if (currentView === 'current') {
			return nonDateFilteredData.filter(alert => alert.active_period_start_date && alert.active_period_start_date <= oneWeekFromNowMs);
		}
		if (currentView === 'future') {
			return nonDateFilteredData.filter(alert => alert.active_period_start_date && alert.active_period_start_date > oneWeekFromNowMs);
		}
		return nonDateFilteredData;
	}, [nonDateFilteredData, currentView, oneWeekFromNowMs]);

	const dataFeatureCollection = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		filteredAlerts.forEach((alert) => {
			const alertFC = transformAlertDataIntoGeoJsonFeature(alert);
			if (alertFC) collection.features.push(alertFC);
		});
		return collection;
	}, [filteredAlerts]);

	const groupedAlerts = useMemo(() => {
		const displayLocale = i18n.language === 'pt' ? 'pt-PT' : i18n.language;
		const today = Dates.now('Europe/Lisbon').startOf('day');
		const tomorrow = today.plus({ days: 1 });
		const yesterday = today.minus({ days: 1 });

		const grouped = filteredAlerts.reduce((result: AlertGroup[], alert) => {
			if (!alert.active_period_start_date) return result;

			const alertStartDate = Dates
				.fromUnixTimestamp(alert.active_period_start_date)
				.setZone('Europe/Lisbon', 'offset_only');
			const alertStartDateString = alertStartDate.toFormat('yyyyMMdd');
			const existingGroup = result.find(group => group.value === alertStartDateString);

			if (existingGroup) {
				existingGroup.items.push(alert);
				return result;
			}

			const alertStartDateCompare = alertStartDate.startOf('day');
			const formattedDate = alertStartDate.toFormat('d LLLL yyyy', { locale: displayLocale });

			const formattedGroupLabel = alertStartDateCompare.unix_timestamp === today.unix_timestamp
				? t('default:alerts.AlertsListGroup.titles.today', '', { value: formattedDate })
				: alertStartDateCompare.unix_timestamp === tomorrow.unix_timestamp
					? t('default:alerts.AlertsListGroup.titles.tomorrow', '', { value: formattedDate })
					: alertStartDateCompare.unix_timestamp === yesterday.unix_timestamp
						? t('default:alerts.AlertsListGroup.titles.yesterday', '', { value: formattedDate })
						: alertStartDateCompare.unix_timestamp < yesterday.unix_timestamp
							? t('default:alerts.AlertsListGroup.titles.past', '', { value: formattedDate })
							: t('default:alerts.AlertsListGroup.titles.future', '', { value: formattedDate });

			result.push({
				items: [alert],
				title: formattedGroupLabel,
				value: alertStartDateString,
			});

			return result;
		}, []);

		return grouped.sort((a, b) => b.value.localeCompare(a.value));
	}, [filteredAlerts, i18n.language, t]);

	//
	// C. Handle actions

	const updateFilterByLineId = useCallback((value: AlertsListContextState['filters']['line_id']) => {
		setFilterByLineIdState(value);
	}, [setFilterByLineIdState]);

	const updateFilterByStopId = useCallback((value: AlertsListContextState['filters']['stop_id']) => {
		setFilterByStopIdState(value);
	}, [setFilterByStopIdState]);

	const updateFilterByCause = useCallback((value: AlertsListContextState['filters']['cause']) => {
		setFilterByCauseState(value);
	}, [setFilterByCauseState]);

	const updateFilterByEffect = useCallback((value: AlertsListContextState['filters']['effect']) => {
		setFilterByEffectState(value);
	}, [setFilterByEffectState]);

	const filterAgencyState = useMemo<UseFilterStateStringReturnType>(() => ({
		isActive: filterAgency.isActive,
		set: filterAgency.set,
		value: filterAgency.value,
	}), [filterAgency.isActive, filterAgency.set, filterAgency.value]);

	const filterSearchState = useMemo<UseFilterStateStringReturnType>(() => ({
		isActive: filterSearch.isActive,
		set: filterSearch.set,
		value: filterSearch.value,
	}), [filterSearch.isActive, filterSearch.set, filterSearch.value]);

	//
	// D. Define context value

	const contextValue = useMemo<AlertsListContextState>(() => ({
		actions: {
			toggle: setCurrentView,
			updateFilterByCause,
			updateFilterByEffect,
			updateFilterByLineId,
			updateFilterByStopId,
		},
		counters: {
			by_date: {
				current: currentWeekCount,
				future: futureWeekCount,
			},
		},
		data: {
			fc: dataFeatureCollection,
			filtered: filteredAlerts,
			grouped: groupedAlerts,
		},
		filters: {
			agency: filterAgencyState,
			cause: filterByCauseState,
			effect: filterByEffectState,
			line_id: filterByLineIdState,
			search: filterSearchState,
			stop_id: filterByStopIdState,
		},
		flags: {
			is_loading: alertsContext.flags.is_loading,
		},
		view: {
			current: currentView,
		},
	}), [alertsContext.flags.is_loading, currentView, currentWeekCount, dataFeatureCollection, filterAgencyState, filterByCauseState, filterByEffectState, filterByLineIdState, filterByStopIdState, filteredAlerts, filterSearchState, futureWeekCount, groupedAlerts, setCurrentView, updateFilterByCause, updateFilterByEffect, updateFilterByLineId, updateFilterByStopId]);

	//
	// D. Render components

	return (
		<AlertsListContext.Provider value={contextValue}>
			{children}
		</AlertsListContext.Provider>
	);
};
