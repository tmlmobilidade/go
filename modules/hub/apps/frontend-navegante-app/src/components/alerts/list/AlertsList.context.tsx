'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useTransitModes } from '@/hooks/use-transit-modes';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { type HubAlert } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, useLocalStorage, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface AlertsListContextState extends ListContextStateTemplate {
	data: {
		filtered: HubAlert[]
		grouped: AlertGroup[]
	}
	view: {
		current: 'list' | 'map'
		toggle: (view: 'list' | 'map') => void
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

	const [currentView, setCurrentView] = useLocalStorage<'list' | 'map'>({
		defaultValue: 'list',
		key: 'alerts-current-view',
	});

	//
	// B. Transform data

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
