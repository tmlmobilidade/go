'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useTransitModes } from '@/hooks/use-transit-modes';
import { type AlertGroup } from '@/types/alerts/alert-group';
import { Dates } from '@tmlmobilidade/dates';
import { type HubAlert } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, useLocalStorage, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface AlertsListContextState extends ListContextStateTemplate {
	actions: {
		toggle: (view: 'current' | 'future' | 'map') => void
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

	const [currentView, setCurrentView] = useLocalStorage<'current' | 'future' | 'map'>({
		defaultValue: 'current',
		key: 'alerts-current-view',
	});

	//
	// B. Transform data

	const oneWeekFromNowMs = useMemo(
		() => Dates.now('Europe/Lisbon').plus({ weeks: 1 }).endOf('day').unix_timestamp,
		[],
	);

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

	//
	// C. Define context value

	const contextValue: AlertsListContextState = {
		actions: {
			toggle: setCurrentView,
		},
		counters: {
			by_date: {
				current: currentWeekCount,
				future: futureWeekCount,
			},
		},
		data: {
			filtered: viewFilteredData,
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
