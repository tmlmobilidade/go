'use client';

import { useRidesListFilterAcceptanceStatus } from '@/components/rides/list/filters/RidesListFilterAcceptanceStatus/use-rides-list-filter-acceptance-status';
import { useRidesListFilterAgency } from '@/components/rides/list/filters/RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '@/components/rides/list/filters/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterAnalysisExpectedApexValidationInterval } from '@/components/rides/list/filters/RidesListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useRidesListFilterAnalysisSimpleThreeEvents } from '@/components/rides/list/filters/RidesListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useRidesListFilterAnalysisTransactionSequentiality } from '@/components/rides/list/filters/RidesListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useRidesListFilterDateRange } from '@/components/rides/list/filters/RidesListFilterDateRange/use-rides-list-filter-date-range';
import { useRidesListFilterDriver } from '@/components/rides/list/filters/RidesListFilterDriver/use-rides-list-filter-driver';
import { useRidesListFilterEndDelayStatus } from '@/components/rides/list/filters/RidesListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useRidesListFilterOperationalStatus } from '@/components/rides/list/filters/RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterStartDelayStatus } from '@/components/rides/list/filters/RidesListFilterStartDelayStatus/use-rides-list-filter-start-delay-status';
import { useRidesListFilterTicketingStatus } from '@/components/rides/list/filters/RidesListFilterTicketingStatus/use-rides-list-filter-ticketing-status';
import { useRidesListFilterVehicle } from '@/components/rides/list/filters/RidesListFilterVehicle/use-rides-list-filter-vehicle';
import { useRidesListFilterSearch } from '@/components/rides/list/shared/RidesListHeader/use-rides-list-filter-search';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ControllerRidesListFilters, type ControllerRidesListItem } from '@tmlmobilidade/go-controller-pckg-queries';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseRidesListDataReturnType {
	data: ControllerRidesListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
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
	const filterVehicle = useRidesListFilterVehicle();
	const filterDriver = useRidesListFilterDriver();
	const filterStartDelayStatus = useRidesListFilterStartDelayStatus();
	const filterEndDelayStatus = useRidesListFilterEndDelayStatus();
	const filterOperationalStatus = useRidesListFilterOperationalStatus();
	const filterSearch = useRidesListFilterSearch();
	const filterTicketingStatus = useRidesListFilterTicketingStatus();

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
		search: filterSearch.value,
		start_delay_statuses: filterStartDelayStatus.value,
		start_time_scheduled_end: filterDateRange.value_end,
		start_time_scheduled_start: filterDateRange.value_start,
		vehicle_ids: filterVehicle.value,
		// ticketing_statuses: filterTicketingStatus.value,
	}), [filterAcceptanceStatus.value, filterDriver.value, filterVehicle.value, filterAgency.value, filterAnalysisAtLeastOneVehicleEventOnLastStop.value, filterAnalysisExpectedApexValidationInterval.value, filterAnalysisSimpleThreeEvents.value, filterAnalysisTransactionSequentiality.value, filterStartDelayStatus.value, filterEndDelayStatus.value, filterOperationalStatus.value, filterSearch.value, filterDateRange.value_end, filterDateRange.value_start, filterTicketingStatus.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<ControllerRidesListItem[]>>([API_ROUTES.controller.RIDES_LIST, query], {
		fetcher: async ([url, query]) => await fetchDataNew<ControllerRidesListItem[]>(url, 'POST', query),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// D. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating]);
};
