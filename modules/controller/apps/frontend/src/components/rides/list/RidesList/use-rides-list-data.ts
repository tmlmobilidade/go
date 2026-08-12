'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type ControllerRidesListFilters, type ControllerRidesListItem } from '@tmlmobilidade/go-controller-pckg-queries';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchData } from '@tmlmobilidade/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { useRidesListFilterAcceptanceStatus } from '../RidesListFilterAcceptanceStatus/use-rides-list-filter-acceptance-status';
import { useRidesListFilterAgency } from '../RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '../RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterAnalysisExpectedApexValidationInterval } from '../RidesListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useRidesListFilterAnalysisSimpleThreeEvents } from '../RidesListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useRidesListFilterAnalysisTransactionSequentiality } from '../RidesListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useRidesListFilterDateRange } from '../RidesListFilterDateRange/use-rides-list-filter-date-range';
import { useRidesListFilterDriver } from '../RidesListFilterDriver/use-rides-list-filter-driver';
import { useRidesListFilterEndDelayStatus } from '../RidesListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useRidesListFilterOperationalStatus } from '../RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterStartDelayStatus } from '../RidesListFilterStartDelayStatus/use-rides-list-filter-start-delay-status';
import { useRidesListFilterTicketingStatus } from '../RidesListFilterTicketingStatus/use-rides-list-filter-ticketing-status';
import { useRidesListFilterVehicle } from '../RidesListFilterVehicle/use-rides-list-filter-vehicle';
import { useRidesListFilterSearch } from '../RidesListHeader/use-rides-list-filter-search';

/* * */

interface UseRidesListDataReturnType {
	data: ControllerRidesListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	lastUpdatedAt: null | UnixTimestamp
}

/* * */

export function useRidesListData(): UseRidesListDataReturnType {
	//

	//
	// A. Setup variables

	const [lastUpdatedAt, setLastUpdatedAt] = useState<null | UnixTimestamp>(null);

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
		// analysis_at_least_one_vehicle_event_on_last_stop_grades: filterAnalysisAtLeastOneVehicleEventOnLastStop.value,
		// analysis_expected_apex_validation_interval_grades: filterAnalysisExpectedApexValidationInterval.value,
		// analysis_simple_three_vehicle_events_grades: filterAnalysisSimpleThreeEvents.value,
		// analysis_transaction_sequentiality_grades: filterAnalysisTransactionSequentiality.value,
		// start_delay_statuses: filterStartDelayStatus.value,
		// end_delay_statuses: filterEndDelayStatus.value,
		driver_ids: filterDriver.value,
		operational_statuses: filterOperationalStatus.value,
		search: filterSearch.value,
		start_time_scheduled_end: filterDateRange.value_end,
		start_time_scheduled_start: filterDateRange.value_start,
		vehicle_ids: filterVehicle.value,
		// ticketing_statuses: filterTicketingStatus.value,
	}), [filterAcceptanceStatus.value, filterAgency.value, filterAnalysisAtLeastOneVehicleEventOnLastStop.value, filterAnalysisExpectedApexValidationInterval.value, filterAnalysisSimpleThreeEvents.value, filterAnalysisTransactionSequentiality.value, filterStartDelayStatus.value, filterEndDelayStatus.value, filterOperationalStatus.value, filterSearch.value, filterDateRange.value_end, filterDateRange.value_start, filterTicketingStatus.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ControllerRidesListItem[]>([API_ROUTES.controller.RIDES_LIST, query], {
		fetcher: async ([url, query]) => {
			const response = await fetchData<ControllerRidesListItem[]>(url, 'POST', query);
			return response.data;
		},
		onSuccess: () => {
			const now = Dates.now('local').unix_timestamp;
			setLastUpdatedAt(now);
		},
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// D. Return data

	return useMemo(() => ({
		data,
		error,
		isLoading,
		isValidating,
		lastUpdatedAt,
	}), [data, error, isLoading, isValidating, lastUpdatedAt]);
};
