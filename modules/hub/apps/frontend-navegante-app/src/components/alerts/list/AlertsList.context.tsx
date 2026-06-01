'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useTransitModes } from '@/hooks/use-transit-modes';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { type HubAlert } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, useLocalStorage, useSearch } from '@tmlmobilidade/ui';
import { DateTime } from 'luxon';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface AlertsListContextState extends ListContextStateTemplate {
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
	view: {
		current: 'current' | 'future' | 'map'
		toggle: (view: 'current' | 'future' | 'map') => void
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

	const filterSearch = useFilterStateString('search');

	const [currentView, setCurrentView] = useLocalStorage<'current' | 'future' | 'map'>({
		defaultValue: 'current',
		key: 'alerts-current-view',
	});

	//
	// B. Transform data
	const currentWeekAlerts = alertsContext.data.alerts?.filter((item) => {
		const oneWeekFromNowInUnixSeconds = DateTime.now().plus({ week: 1 }).endOf('day').toUnixInteger();
		const alertStartDateInSeconds = Dates.fromUnixTimestamp(item.active_period_start_date).unix_timestamp;
		// If the alert start date is before one week from now, then the alert is considered 'current'.
		return alertStartDateInSeconds <= oneWeekFromNowInUnixSeconds;
	}).length;

	const searchResultsData = useSearch<HubAlert>({
		accessors: ['title', 'description'],
		data: alertsContext.data.alerts,
		query: filterSearch.value,
	});

	const filteredData = useMemo(() => {
		return searchResultsData?.filter((alert) => {
			return activeAgencyIds.includes(alert.agency_id);
		});
	}, [searchResultsData, activeAgencyIds]);

	const groupedAlerts = useMemo(() => {
		return filteredData.reduce((acc: AlertGroup[], alert: HubAlert): AlertGroup[] => {
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
	}, [filteredData]);

	//
	// C. Define context value

	const contextValue: AlertsListContextState = {
		counters: {
			by_date: {
				current: currentWeekAlerts,
				future: alertsContext.data.alerts?.length - currentWeekAlerts,
			},
		},
		data: {
			filtered: filteredData,
			grouped: groupedAlerts,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: undefined,
			isLoading: alertsContext.flags.isLoading,
		},
		view: {
			current: currentView,
			toggle: setCurrentView,
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
