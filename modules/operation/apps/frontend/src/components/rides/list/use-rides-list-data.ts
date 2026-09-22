'use client';

import { useRidesFavoritesData } from '@/components/rides/shared/use-rides-favorites-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ControllerRidesListFilters, type ControllerRidesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRidesListFilterAcceptanceStatus } from './filters/RidesListFilterAcceptanceStatus/use-rides-list-filter-acceptance-status';
import { useRidesListFilterAgency } from './filters/RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from './filters/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterAnalysisExpectedApexValidationInterval } from './filters/RidesListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useRidesListFilterAnalysisSimpleThreeEvents } from './filters/RidesListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useRidesListFilterAnalysisTransactionSequentiality } from './filters/RidesListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useRidesListFilterDateRange } from './filters/RidesListFilterDateRange/use-rides-list-filter-date-range';
import { useRidesListFilterDriver } from './filters/RidesListFilterDriver/use-rides-list-filter-driver';
import { useRidesListFilterEndDelayStatus } from './filters/RidesListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useRidesListFilterFavorites } from './filters/RidesListFilterFavorites/use-rides-list-filter-favorites';
import { useRidesListFilterLine } from './filters/RidesListFilterLine/use-rides-list-filter-line';
import { useRidesListFilterOperationalStatus } from './filters/RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterSearch } from './filters/RidesListFilterSearch/use-rides-list-filter-search';
import { useRidesListFilterStartDelayStatus } from './filters/RidesListFilterStartDelayStatus/use-rides-list-filter-start-delay-status';
import { useRidesListFilterTicketingStatus } from './filters/RidesListFilterTicketingStatus/use-rides-list-filter-ticketing-status';
import { useRidesListFilterVehicle } from './filters/RidesListFilterVehicle/use-rides-list-filter-vehicle';

/* * */

interface UseRidesListDataReturnType {
	data: ControllerRidesListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixMilliseconds
}

/* * */

export function useRidesListData(): UseRidesListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAcceptanceStatus = useRidesListFilterAcceptanceStatus();
	const filterAgency = useRidesListFilterAgency();
	const filterAnalysisAtLeastOneVehicleEventOnLastStop = useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop();
	const filterAnalysisExpectedApexValidationInterval = useRidesListFilterAnalysisExpectedApexValidationInterval();
	const filterAnalysisSimpleThreeEvents = useRidesListFilterAnalysisSimpleThreeEvents();
	const filterAnalysisTransactionSequentiality = useRidesListFilterAnalysisTransactionSequentiality();
	const filterDateRange = useRidesListFilterDateRange();
	const filterFavorites = useRidesListFilterFavorites();
	const filterLine = useRidesListFilterLine();
	const filterVehicle = useRidesListFilterVehicle();
	const filterDriver = useRidesListFilterDriver();
	const filterStartDelayStatus = useRidesListFilterStartDelayStatus();
	const filterEndDelayStatus = useRidesListFilterEndDelayStatus();
	const filterOperationalStatus = useRidesListFilterOperationalStatus();
	const filterSearch = useRidesListFilterSearch();
	const filterTicketingStatus = useRidesListFilterTicketingStatus();

	const { data: favoriteRideIds } = useRidesFavoritesData();

	//
	// B. Transform data

	const query = useMemo<ControllerRidesListFilters>(() => ({
		// acceptance_statuses: filterAcceptanceStatus.value,
		agency_ids: filterAgency.value,
		analysis_at_least_one_vehicle_event_on_last_stop_grades: filterAnalysisAtLeastOneVehicleEventOnLastStop.value,
		analysis_expected_apex_validation_interval_grades: filterAnalysisExpectedApexValidationInterval.value,
		analysis_simple_three_vehicle_events_grades: filterAnalysisSimpleThreeEvents.value,
		analysis_transaction_sequentiality_grades: filterAnalysisTransactionSequentiality.value,
		driver_ids: filterDriver.value,
		end_delay_statuses: filterEndDelayStatus.value,
		operational_statuses: filterOperationalStatus.value,
		route_short_names: filterLine.value,
		search: filterSearch.value,
		start_delay_statuses: filterStartDelayStatus.value,
		start_time_scheduled_end: filterDateRange.value_end,
		start_time_scheduled_start: filterDateRange.value_start,
		vehicle_ids: filterVehicle.value,
		// ticketing_statuses: filterTicketingStatus.value,
	}), [filterAcceptanceStatus.value, filterDriver.value, filterLine.value, filterVehicle.value, filterAgency.value, filterAnalysisAtLeastOneVehicleEventOnLastStop.value, filterAnalysisExpectedApexValidationInterval.value, filterAnalysisSimpleThreeEvents.value, filterAnalysisTransactionSequentiality.value, filterStartDelayStatus.value, filterEndDelayStatus.value, filterOperationalStatus.value, filterSearch.value, filterDateRange.value_end, filterDateRange.value_start, filterTicketingStatus.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<ControllerRidesListItem[]>>([API_ROUTES.operation.RIDES_LIST, query], {
		fetcher: async ([url, query]: [string, ControllerRidesListFilters]) => await fetchApiData<ControllerRidesListItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 30_000, // 30 seconds
	});

	//
	// D. Transform data

	const ridesData = useMemo(() => {
		if (!data?.data) return data?.data;
		if (!filterFavorites.value) return data.data;
		const favoriteIds = new Set(favoriteRideIds);
		return data.data.filter(ride => favoriteIds.has(ride._id));
	}, [data?.data, favoriteRideIds, filterFavorites.value]);

	//
	// E. Return data

	return useMemo(() => ({
		data: ridesData,
		error: error?.error,
		isLoading,
		isValidating,
		timestamp: data?.timestamp,
	}), [data?.timestamp, error, isLoading, isValidating, ridesData]);
};
