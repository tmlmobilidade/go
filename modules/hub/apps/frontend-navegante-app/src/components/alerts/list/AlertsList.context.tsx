'use client';

import { useAlertsContext } from '@/contexts/Alerts.context';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { type HubAlert } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface AlertsListContextState extends ListContextStateTemplate {
	data: {
		filtered: HubAlert[]
		grouped: AlertGroup[]
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

	const filterSearch = useFilterStateString('search');

	//
	// B. Transform data

	const searchResultsData = useSearch<HubAlert>({
		accessors: ['title', 'description'],
		data: alertsContext.data.alerts,
		query: filterSearch.value,
	});

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

	//
	// C. Define context value

	const contextValue: AlertsListContextState = {
		data: {
			filtered: searchResultsData,
			grouped: groupedAlerts,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: undefined,
			isLoading: alertsContext.flags.isLoading,
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
