'use client';

import type { Alert, AlertCause, AlertEffect } from '@tmlmobilidade/go-hub-pckg-types';

import { getAlertDescription, getAlertStartDateOrEpoch, getAlertTitle } from '@/utils/alerts';
import { agencyMatchesSelection, agencyMatchesTransports } from '@/utils/transportAgencies';
import { DateTime } from 'luxon';
import { useLocale } from 'next-intl';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useMemo, useState } from 'react';

import { useAlertsContext } from './Alerts.context';
import { useGlobalSettingsContext } from './GlobalSettings.context';

/* * */

interface AlertsListContextState {
	actions: {
		updateFilterByCause: (value: AlertCause | null) => void
		updateFilterByDate: (value: string) => void
		updateFilterByEffect: (value: AlertEffect | null) => void
		updateFilterByLineId: (value: string) => void
		updateFilterBySearchQuery: (value: string) => void
		updateFilterByStopId: (value: string) => void
		// updateFilterByMunicipalityId: (value: string) => void
	}
	counters: {
		by_date: {
			current: number
			future: number
		}
	}
	data: {
		filtered: Alert[]
		raw: Alert[]
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

	const locale = useLocale();

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
	const globalSettingsContext = useGlobalSettingsContext();

	const filterByAgency = globalSettingsContext.filterbar.by_agency;
	const filterByTransports = globalSettingsContext.filterbar.transports;

	const allAlertsData = useMemo(() => alertsContext.data.alerts, [alertsContext.data.alerts]);

	//
	// C. Transform data

	const currentWeekAlerts = useMemo(() => {
		if (!allAlertsData?.length) return 0;
		const oneWeekFromNowInUnixSeconds = DateTime.now().plus({ week: 1 }).endOf('day').toUnixInteger();
		return allAlertsData.filter((item) => {
			const alertStartDateInSeconds = DateTime.fromJSDate(getAlertStartDateOrEpoch(item)).toUnixInteger();
			return alertStartDateInSeconds <= oneWeekFromNowInUnixSeconds;
		}).length;
	}, [allAlertsData]);

	const dataFilteredState = useMemo(() => {
		let filterResult: Alert[] = [...(allAlertsData || [])];

		const oneWeekFromNowInUnixSeconds = DateTime.now().plus({ week: 1 }).endOf('day').toUnixInteger();

		filterResult = filterResult.filter((item) => {
			const alertStartDateInSeconds = DateTime.fromJSDate(getAlertStartDateOrEpoch(item)).toUnixInteger();
			if (filterByDateState === 'current') {
				return alertStartDateInSeconds <= oneWeekFromNowInUnixSeconds;
			}
			return alertStartDateInSeconds > oneWeekFromNowInUnixSeconds;
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
				const title = getAlertTitle(alert, locale).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				const description = getAlertDescription(alert, locale).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				return title.includes(searchQuery) || description.includes(searchQuery);
			});
		}

		if (filterByCauseState) {
			filterResult = filterResult.filter(alert => alert.cause === filterByCauseState);
		}

		if (filterByEffectState) {
			filterResult = filterResult.filter(alert => alert.effect === filterByEffectState);
		}

		if (filterByAgency.length > 0 || filterByTransports.length > 0) {
			filterResult = filterResult.filter((alert) => {
				return alert.informed_entity.some((entity) => {
					if (!entity.agency_id) return false;
					return agencyMatchesSelection(entity.agency_id, filterByAgency) && agencyMatchesTransports(entity.agency_id, filterByTransports);
				});
			});
		}

		return filterResult;
	}, [allAlertsData, filterByAgency, filterByCauseState, filterByDateState, filterByEffectState, filterByLineIdState, filterBySearchQueryState, filterByStopIdState, filterByTransports, locale]);

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
