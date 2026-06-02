'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useTransitModes } from '@/hooks/use-transit-modes';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { AlertCause, AlertEffect, type HubAlert } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, UseFilterStateStringReturnType, useLocalStorage, useQueryState, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface AlertsListContextState extends ListContextStateTemplate {
	actions: {
		toggle: (view: 'current' | 'future' | 'map') => void
		updateFilterByCause: (value: AlertCause | null) => void
		updateFilterByEffect: (value: AlertEffect | null) => void
		updateFilterByLineId: (value: string) => void
		// updateFilterBySearch: (value: string) => void
		updateFilterByStopId: (value: string) => void
	}
	counters: {
		by_date: {
			current: number
			future: number
		}
	}
	data: {
		filtered: HubAlert[]
		grouped: AlertGroup[]
	}
	filters: {
		cause: AlertCause | null
		effect: AlertEffect | null
		line_id: null | string
		search: UseFilterStateStringReturnType
		stop_id: null | string
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

	const { activeAgencyIds } = useTransitModes();

	const { i18n, t } = useTranslation();

	const filterSearch = useFilterStateString('search');

	const [dataFilteredState, setDataFilteredState] = useState<HubAlert[]>([]);

	const [currentView, setCurrentView] = useLocalStorage<'current' | 'future' | 'map'>({ defaultValue: 'current', key: 'alerts-current-view' });
	const [filterByLineIdState, setFilterByLineIdState] = useQueryState('line_id');
	const [filterBySearchQueryState, setFilterBySearchQueryState] = useQueryState('search_query');
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
		return (searchResultsData ?? []).filter(alert => activeAgencyIds.includes(alert.agency_id));
	}, [searchResultsData, activeAgencyIds]);

	const { currentWeekCount, filtered: viewFilteredData, futureWeekCount } = useMemo(() => {
		let current = 0;
		let future = 0;
		const filtered: HubAlert[] = [];

		for (const alert of baseFilteredData) {
			if (!alert.active_period_start_date) continue;

			const isCurrent = alert.active_period_start_date <= oneWeekFromNowMs;
			if (isCurrent) current++;
			else future++;

			if (currentView === 'current' && isCurrent) filtered.push(alert);
			if (currentView === 'future' && !isCurrent) filtered.push(alert);
		}

		return {
			currentWeekCount: current,
			filtered,
			futureWeekCount: future,
		};
	}, [baseFilteredData, currentView, oneWeekFromNowMs]);

	const groupedAlerts = useMemo(() => {
		const displayLocale = i18n.language === 'pt' ? 'pt-PT' : i18n.language;
		const today = Dates.now('Europe/Lisbon').startOf('day');
		const tomorrow = today.plus({ days: 1 });
		const yesterday = today.minus({ days: 1 });

		const grouped = viewFilteredData.reduce((result: AlertGroup[], alert) => {
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

			let formattedGroupLabel = '';
			if (alertStartDateCompare.unix_timestamp === today.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.today', '', { value: formattedDate });
			} else if (alertStartDateCompare.unix_timestamp === tomorrow.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.tomorrow', '', { value: formattedDate });
			} else if (alertStartDateCompare.unix_timestamp === yesterday.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.yesterday', '', { value: formattedDate });
			} else if (alertStartDateCompare.unix_timestamp < yesterday.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.past', '', { value: formattedDate });
			} else {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.future', '', { value: formattedDate });
			}

			result.push({
				items: [alert],
				title: formattedGroupLabel,
				value: alertStartDateString,
			});

			return result;
		}, []);

		return grouped.sort((a, b) => b.value.localeCompare(a.value));
	}, [viewFilteredData, i18n.language, t]);

	// Filters

	const applyFiltersToData = () => {
		//

		let filterResult: HubAlert[] = baseFilteredData || [];

		//
		// Filter by_date

		if (currentView === 'current') {
			filterResult = filterResult.filter(alert => alert.active_period_start_date <= oneWeekFromNowMs);
		} else if (currentView === 'future') {
			filterResult = filterResult.filter(alert => alert.active_period_start_date > oneWeekFromNowMs);
		}

		if (filterByLineIdState) {
			filterResult = filterResult.filter(alert => alert.references.some(reference => reference.parent_id === filterByLineIdState));
		}

		if (filterByStopIdState) {
			filterResult = filterResult.filter(alert => alert.references.some(reference => reference.child_ids.includes(filterByStopIdState)));
		}

		// TODO: municipalityId does not exist in the informed_entity, needs to be added in API
		// if (filterByMunicipalityIdState) {
		// 	filterResult = filterResult.filter(alert => alert.informed_entity.some(entity => entity.municipalityId === filterByMunicipalityIdState));
		// }

		if (filterBySearchQueryState) {
			filterResult = filterResult.filter((alert) => {
				const searchQuery = filterBySearchQueryState.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				return (
					alert.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchQuery)
					|| alert.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchQuery)
				);
			});
		}

		if (filterByCauseState) {
			filterResult = filterResult.filter(alert => alert.cause === filterByCauseState);
		}

		if (filterByEffectState) {
			filterResult = filterResult.filter(alert => alert.effect === filterByEffectState);
		}

		//
		// Save filter result to state
		return filterResult;

		//
	};

	useEffect(() => {
		const filteredAlerts = applyFiltersToData();
		setDataFilteredState(filteredAlerts);
	}, [baseFilteredData, currentView, filterByLineIdState, filterByStopIdState, filterBySearchQueryState, filterByCauseState, filterByEffectState]);

	//
	// D. Handle actions

	const updateFilterByLineId = (value: AlertsListContextState['filters']['line_id']) => {
		setFilterByLineIdState(value);
	};

	const updateFilterByStopId = (value: AlertsListContextState['filters']['stop_id']) => {
		setFilterByStopIdState(value);
	};

	// const updateFilterBySearch = (value: AlertsListContextState['filters']['search']) => {
	// 	setFilterBySearchQueryState(value);
	// };

	const updateFilterByCause = (value: AlertsListContextState['filters']['cause']) => {
		setFilterByCauseState(value);
	};

	const updateFilterByEffect = (value: AlertsListContextState['filters']['effect']) => {
		setFilterByEffectState(value);
	};

	//
	// D. Define context value

	const contextValue: AlertsListContextState = {
		actions: {
			toggle: setCurrentView,
			updateFilterByCause,
			updateFilterByEffect,
			updateFilterByLineId,
			// updateFilterBySearch,
			updateFilterByStopId,
		},
		counters: {
			by_date: {
				current: currentWeekCount,
				future: futureWeekCount,
			},
		},
		data: {
			filtered: dataFilteredState,
			grouped: groupedAlerts,
		},
		filters: {
			cause: filterByCauseState,
			effect: filterByEffectState,
			line_id: filterByLineIdState,
			search: filterSearch,
			stop_id: filterByStopIdState,
		},
		flags: {
			error: undefined,
			isLoading: alertsContext.flags.isLoading,
		},
		view: {
			current: currentView,
		},
	};

	//
	// D. Render components

	return (
		<AlertsListContext.Provider value={contextValue}>
			{children}
		</AlertsListContext.Provider>
	);
};
