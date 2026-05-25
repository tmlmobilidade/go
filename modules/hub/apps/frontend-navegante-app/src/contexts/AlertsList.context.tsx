'use client';

import type { AlertCause, AlertEffect, SimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-types';

import { useQueryState } from 'nuqs';
import { createContext, useContext, useMemo, useState } from 'react';

import { useAlertsContext } from './Alerts.context';

/* * */

interface AlertsListContextState {
	actions: {
		updateFilterByCause: (value: AlertCause | null) => void
		updateFilterByDate: (value: string) => void
		updateFilterByEffect: (value: AlertEffect | null) => void
		updateFilterByLineId: (value: string) => void
		updateFilterBySearchQuery: (value: string) => void
		updateFilterByStopId: (value: string) => void	}
	counters: {
		by_date: {
			current: number
			future: number
		}
	}
	data: {
		filtered: SimplifiedAlert[]
		raw: SimplifiedAlert[]
	}
	filters: {
		by_date: 'current' | 'future' | 'map'
		cause: AlertCause | null
		effect: AlertEffect | null
		line_id: null | string
		search_query: null | string
		stop_id: null | string
		// municipality_id: null | string
	}
	flags: {
		is_loading: boolean
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

export const AlertsListContextProvider = ({ children }) => {
	//

	//
	// A. Setup variables

	const [filterByDateState, setFilterByDateState] = useState <AlertsListContextState['filters']['by_date']>('current');
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
	// const [filterByMunicipalityIdState, setFilterByMunicipalityIdState] = useQueryState('municipality_id');

	const [isLoading] = useState(false);

	//
	// B. Fetch data

	const alertsContext = useAlertsContext();
	const allAlertsData = useMemo(() => alertsContext.data.alerts, [alertsContext.data.alerts]);

	//
	// C. Transform data

	const currentWeekAlerts = useMemo(() => {
		if (!allAlertsData?.length) return 0;
		return allAlertsData.filter(alertsContext.actions.isAlertInThisWeek).length;
	}, [allAlertsData]);

	const dataFilteredState = useMemo(() => {
		let filterResult: SimplifiedAlert[] = [...(allAlertsData || [])];

		filterResult = filterResult.filter((item) => {
			if (filterByDateState === 'current') {
				return alertsContext.actions.isAlertInThisWeek(item);
			}
			return alertsContext.actions.isAlertStartingAfterThisWeek(item);
		});

		if (filterByLineIdState) {
			filterResult = filterResult.filter(alert => alert.informed_entity.some(entity => entity.line_id === filterByLineIdState));
		}

		if (filterByStopIdState) {
			filterResult = filterResult.filter(alert => alert.informed_entity.some(entity => entity.stop_id === filterByStopIdState));
		}

		if (filterBySearchQueryState) {
			filterResult = filterResult.filter((alert) => {
				const searchQuery = filterBySearchQueryState.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				const title = alert.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				const description = alert.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				return title.includes(searchQuery) || description.includes(searchQuery);
			});
		}

		if (filterByCauseState) {
			filterResult = filterResult.filter(alert => alert.cause === filterByCauseState);
		}

		if (filterByEffectState) {
			filterResult = filterResult.filter(alert => alert.effect === filterByEffectState);
		}

		return filterResult;
	}, [allAlertsData, alertsContext.actions, filterByCauseState, filterByDateState, filterByEffectState, filterByLineIdState, filterBySearchQueryState, filterByStopIdState]);

	//
	// D. Handle actions

	const updateFilterByDate = (value: AlertsListContextState['filters']['by_date']) => {
		setFilterByDateState(value);
	};

	const updateFilterByLineId = (value: AlertsListContextState['filters']['line_id']) => {
		setFilterByLineIdState(value);
	};

	const updateFilterByStopId = (value: AlertsListContextState['filters']['stop_id']) => {
		setFilterByStopIdState(value);
	};

	const updateFilterBySearchQuery = (value: AlertsListContextState['filters']['search_query']) => {
		setFilterBySearchQueryState(value);
	};

	const updateFilterByCause = (value: AlertsListContextState['filters']['cause']) => {
		setFilterByCauseState(value);
	};

	const updateFilterByEffect = (value: AlertsListContextState['filters']['effect']) => {
		setFilterByEffectState(value);
	};

	//
	// E. Define context value

	const contextValue: AlertsListContextState = {
		actions: {
			updateFilterByCause,
			updateFilterByDate,
			updateFilterByEffect,
			updateFilterByLineId,
			updateFilterBySearchQuery,
			updateFilterByStopId,
		},
		counters: {
			by_date: {
				current: currentWeekAlerts,
				future: Math.max(0, (allAlertsData?.length ?? 0) - currentWeekAlerts),
			},
		},
		data: {
			filtered: dataFilteredState,
			raw: allAlertsData || [],
		},
		filters: {
			by_date: filterByDateState,
			cause: filterByCauseState,
			effect: filterByEffectState,
			line_id: filterByLineIdState,
			search_query: filterBySearchQueryState,
			stop_id: filterByStopIdState,
		},
		flags: {
			is_loading: isLoading,
		},
	};

	//
	// F. Render components

	return (
		<AlertsListContext.Provider value={contextValue}>
			{children}
		</AlertsListContext.Provider>
	);

	//
};
