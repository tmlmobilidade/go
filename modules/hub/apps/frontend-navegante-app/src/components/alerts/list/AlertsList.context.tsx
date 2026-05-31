'use client';

import { useAlertsContext } from '@/contexts/Alerts.context';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert } from '@tmlmobilidade/types';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

/* * */

interface AlertsListContextState {
	actions: {
		updateFilterByDate: (value: string) => void
		updateFilterBySearchQuery: (value: string) => void
	}
	data: {
		filtered: Alert[]
		grouped: AlertGroup[]
	}
	filters: {
		by_date: 'current' | 'future' | 'map'
		search_query: null | string
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

export function AlertsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const alertsContext = useAlertsContext();

	console.log(alertsContext.data.alerts);

	const [filterByDateState, setFilterByDateState] = useState <AlertsListContextState['filters']['by_date']>('current');
	const [filterBySearchQueryState, setFilterBySearchQueryState] = useQueryState('search_query');

	//
	// C. Transform data

	const groupedAlerts = useMemo(() => {
		return alertsContext.data.alerts.reduce((acc: AlertGroup[], alert: Alert): AlertGroup[] => {
			if (!alert.active_period_start_date) return acc;
			const date = Dates.fromUnixTimestamp(alert.active_period_start_date).toFormat('yyyyMMdd');
			const existingGroup = acc.find(group => group.value === date);
			if (existingGroup) {
				existingGroup.items.push(alert);
			} else {
				acc.push({ items: [alert], title: date, value: date });
			}
			return acc;
		}, []);
	}, [alertsContext.data.alerts]);

	const dataFilteredState = useMemo(() => {
		const filterResult: Alert[] = [...(alertsContext.data.alerts || [])];

		// filterResult = filterResult.filter((item) => {
		// 	if (filterByDateState === 'current') {
		// 		return alertsContext.actions.isAlertInThisWeek(item);
		// 	}
		// 	return alertsContext.actions.isAlertStartingAfterThisWeek(item);
		// });

		// if (filterBySearchQueryState) {
		// 	filterResult = filterResult.filter((alert) => {
		// 		const searchQuery = filterBySearchQueryState.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		// 		const title = alert.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		// 		const description = alert.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		// 		return title.includes(searchQuery) || description.includes(searchQuery);
		// 	});
		// }
		return filterResult;
	}, [alertsContext.data.alerts]);

	//
	// D. Handle actions

	const updateFilterByDate = (value: AlertsListContextState['filters']['by_date']) => {
		setFilterByDateState(value);
	};

	const updateFilterBySearchQuery = (value: AlertsListContextState['filters']['search_query']) => {
		setFilterBySearchQueryState(value);
	};

	//
	// E. Define context value

	const contextValue: AlertsListContextState = {
		actions: {
			updateFilterByDate,
			updateFilterBySearchQuery,
		},
		data: {
			filtered: dataFilteredState,
			grouped: groupedAlerts,
		},
		filters: {
			by_date: filterByDateState,
			search_query: filterBySearchQueryState,
		},
		flags: {
			is_loading: alertsContext.flags.is_loading,
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
