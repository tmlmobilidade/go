'use client';

import { useAlertsContext } from '@/contexts/Alerts.context';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { type HubAlert } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

/* * */

interface AlertsListContextState {
	actions: {
		updateFilterByDate: (value: string) => void
		updateFilterBySearch: (value: string) => void
	}
	data: {
		filtered: HubAlert[]
		grouped: AlertGroup[]
	}
	filters: {
		by_date: 'current' | 'future' | 'map'
		by_search: string
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

	const [filterByDateState, setFilterByDateState] = useState <AlertsListContextState['filters']['by_date']>('current');
	const [filterBySearchState, setFilterBySearchState] = useState <AlertsListContextState['filters']['by_search']>('');

	//
	// C. Transform data

	const groupedAlerts = useMemo(() => {
		return alertsContext.data.alerts.reduce((acc: AlertGroup[], alert: HubAlert): AlertGroup[] => {
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
		const filterResult: HubAlert[] = [...(alertsContext.data.alerts || [])];

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

	const updateFilterBySearch = (value: AlertsListContextState['filters']['by_search']) => {
		setFilterBySearchState(value);
	};

	//
	// E. Define context value

	const contextValue: AlertsListContextState = {
		actions: {
			updateFilterByDate,
			updateFilterBySearch,
		},
		data: {
			filtered: dataFilteredState,
			grouped: groupedAlerts,
		},
		filters: {
			by_date: filterByDateState,
			by_search: filterBySearchState,
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
