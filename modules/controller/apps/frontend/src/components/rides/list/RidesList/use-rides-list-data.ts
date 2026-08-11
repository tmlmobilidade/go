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
import { useRidesListFilterDelayStatus } from '../RidesListFilterDelayStatus/use-rides-list-filter-delay-status';
import { useRidesListFilterOperationalStatus } from '../RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterTicketingStatus } from '../RidesListFilterTicketingStatus/use-rides-list-filter-ticketing-status';
import { useRidesListFilterSearch } from '../RidesListHeader/use-rides-list-filter-search';

/* * */

interface UseRidesListDataReturnType {
	data: ControllerRidesListItem[]
	error: null | string
	isLoading: boolean
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
	const filterDelayStatus = useRidesListFilterDelayStatus();
	const filterOperationalStatus = useRidesListFilterOperationalStatus();
	const filterSearch = useRidesListFilterSearch();
	const filterTicketingStatus = useRidesListFilterTicketingStatus();

	//
	// B. Transform data

	const query = useMemo<ControllerRidesListFilters>(() => ({
		acceptance_statuses: filterAcceptanceStatus.value,
		agency_ids: filterAgency.value,
		analysis_at_least_one_vehicle_event_on_last_stop_grades: filterAnalysisAtLeastOneVehicleEventOnLastStop.value,
		analysis_expected_apex_validation_interval_grades: filterAnalysisExpectedApexValidationInterval.value,
		analysis_simple_three_vehicle_events_grades: filterAnalysisSimpleThreeEvents.value,
		analysis_transaction_sequentiality_grades: filterAnalysisTransactionSequentiality.value,
		// delay_statuses: filterDelayStatus.value,
		operational_statuses: filterOperationalStatus.value,
		search: filterSearch.value,
		start_time_scheduled_end: filterDateRange.value_end,
		start_time_scheduled_start: filterDateRange.value_start,
		// ticketing_statuses: filterTicketingStatus.value,
	}), [filterAcceptanceStatus.value, filterAgency.value, filterAnalysisAtLeastOneVehicleEventOnLastStop.value, filterAnalysisExpectedApexValidationInterval.value, filterAnalysisSimpleThreeEvents.value, filterAnalysisTransactionSequentiality.value, filterDelayStatus.value, filterOperationalStatus.value, filterSearch.value, filterDateRange.value_end, filterDateRange.value_start, filterTicketingStatus.value]);

	//
	// C. Fetch data

	const { data: data, error: error, isLoading: isLoading } = useSWR<ControllerRidesListItem[]>([API_ROUTES.controller.RIDES_LIST, query], {
		fetcher: async ([url, query]) => {
			const response = await fetchData<ControllerRidesListItem[]>(url, 'POST', query);
			return response.data;
		},
		onSuccess: () => {
			const now = Dates.now('local').unix_timestamp;
			setLastUpdatedAt(now);
		},
	});

	//
	// D. Return data

	return useMemo(() => ({
		data,
		error,
		isLoading,
		lastUpdatedAt,
	}), [data, error, isLoading, lastUpdatedAt]);
};
