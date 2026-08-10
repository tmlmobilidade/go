'use client';

import { useRideFavoritesContext } from '@/contexts/RideFavorites.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { type DelayStatus, DelayStatusSchema, type OperationalStatus, OperationalStatusSchema, type TicketingStatus, TicketingStatusSchema, UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { parseAsInteger, useDataAgencies, useDataRides, useDebouncedValue, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useQueryState } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export interface RidesListContextState {
	actions: {
		setFavoritesEnabled: () => void
		setFilterDateEnd: (value: number) => void
		setFilterDateStart: (value: number) => void
	}
	data: {
		filtered: Ride[]
		filteredByFavoriteIds: Ride[]
	}
	filters: {
		agency_ids: UseFilterStateListReturnType<string>
		delay_statuses: UseFilterStateListReturnType<DelayStatus>
		operational_statuses: UseFilterStateListReturnType<OperationalStatus>
		search: UseFilterStateStringReturnType
		ticketing_statuses: UseFilterStateListReturnType<TicketingStatus>
	}
	flags: {
		error: null | string
		favoritesEnabled: boolean
		last_updated_at: null | UnixTimestamp
		loading: boolean
	}
}

/* * */

const RidesListContext = createContext<RidesListContextState | undefined>(undefined);

export function useRidesListContext() {
	const context = useContext(RidesListContext);
	if (!context) {
		throw new Error('useRidesListContext must be used within a RidesListContextProvider');
	}
	return context;
}

/* * */

export function RidesListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const rideFavoritesContext = useRideFavoritesContext();

	const [favoritesEnabled, setFavoritesEnabled] = useState<boolean>(false);

	const filterSearch = useFilterStateString('search');
	const [debouncedFilterSearch] = useDebouncedValue(filterSearch.value.trim(), 500);

	const [filterDateEnd, setFilterDateEnd] = useQueryState<number>('date_end', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').plus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDateStart, setFilterDateStart] = useQueryState<number>('date_start', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp, [])));

	const filterDelayStatuses = useFilterStateList('delay_statuses', DelayStatusSchema.options, DelayStatusSchema.options.map(item => ({ label: t(`shared:status.delay_status.${item}`), value: item })));
	const filterOperationalStatuses = useFilterStateList('operational_statuses', OperationalStatusSchema.options, OperationalStatusSchema.options.map(item => ({ label: t(`shared:status.operational_status.${item}`), value: item })));
	const filterTicketingStatuses = useFilterStateList('ticketing_statuses', TicketingStatusSchema.options, TicketingStatusSchema.options.map(item => ({ label: t(`default:list.RidesListFilterTicketingStatus.options.${item}`), value: item })));

	//
	// B. Fetch data

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.rides.actions.analysis_read],
		scope: PermissionCatalog.all.rides.scope,
	});

	const filterAgencyIds = useFilterStateList('agency_ids', filteredAgencyIds, filteredAgencyOptions);

	const { error: ridesError, isLoading: ridesLoading, lastUpdatedAt: ridesLastUpdatedAt, raw: ridesData } = useDataRides(API_ROUTES.controller.RIDES_LIST, {
		query: {
			agency_ids: filterAgencyIds.value,
			analyses: {
				at_least_one_vehicle_event_on_last_stop_grade: null,
				expected_apex_validation_interval_grade: null,
				simple_three_vehicle_events_grade: null,
				transaction_sequentiality_grades: null,
			},
			delay_statuses: filterDelayStatuses.value,
			operational_statuses: filterOperationalStatuses.value,
			search: debouncedFilterSearch,
			start_time_scheduled_end: filterDateEnd as UnixTimestamp,
			start_time_scheduled_start: filterDateStart as UnixTimestamp,
			ticketing_statuses: filterTicketingStatuses.value,
		},
	});

	//
	// D. Define context value

	const contextValue: RidesListContextState = useMemo(() => ({
		actions: {
			setFavoritesEnabled: () => setFavoritesEnabled(!favoritesEnabled),
			setFilterDateEnd,
			setFilterDateStart,
		},
		data: {
			filtered: ridesData ?? [],
			filteredByFavoriteIds: rideFavoritesContext.data.favoriteRides,
		},
		filters: {
			agency_ids: filterAgencyIds,
			delay_statuses: filterDelayStatuses,
			operational_statuses: filterOperationalStatuses,
			search: filterSearch,
			ticketing_statuses: filterTicketingStatuses,
		},
		flags: {
			error: ridesError,
			favoritesEnabled,
			last_updated_at: ridesLastUpdatedAt,
			loading: ridesLoading,
		},
	}), [favoritesEnabled, filterAgencyIds, filterDelayStatuses, filterOperationalStatuses, filterSearch, filterTicketingStatuses, rideFavoritesContext.data.favoriteRides, ridesData, ridesError, ridesLastUpdatedAt, ridesLoading, setFilterDateEnd, setFilterDateStart]);

	//
	// E. Render components

	return (
		<RidesListContext.Provider value={contextValue}>
			{children}
		</RidesListContext.Provider>
	);
};
