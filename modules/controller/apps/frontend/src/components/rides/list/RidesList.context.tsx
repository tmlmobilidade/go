'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RideView } from '@tmlmobilidade/go-types-operation';
import { UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useDataRides } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useRidesListFilterAcceptanceStatus } from './RidesListFilterAcceptanceStatus/use-rides-list-filter-acceptance-status';
import { useRidesListFilterAgency } from './RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from './RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterAnalysisExpectedApexValidationInterval } from './RidesListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useRidesListFilterAnalysisSimpleThreeEvents } from './RidesListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useRidesListFilterAnalysisTransactionSequentiality } from './RidesListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useRidesListFilterDateRange } from './RidesListFilterDateRange/use-rides-list-filter-date-range';
import { useRidesListFilterDelayStatus } from './RidesListFilterDelayStatus/use-rides-list-filter-delay-status';
import { useRidesListFilterOperationalStatus } from './RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterTicketingStatus } from './RidesListFilterTicketingStatus/use-rides-list-filter-ticketing-status';
import { useRidesListFilterSearch } from './RidesListHeader/use-rides-list-filter-search';

/* * */

export interface RidesListContextState {
	data: {
		filtered: RideView[]
	}
	flags: {
		error: null | string
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
	// B. Fetch data

	const { error: ridesError, isLoading: ridesLoading, lastUpdatedAt: ridesLastUpdatedAt, raw: ridesData } = useDataRides(API_ROUTES.controller.RIDES_LIST, {
		query: {
			// acceptance_statuses: filterAcceptanceStatus.value,
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
			ticketing_statuses: filterTicketingStatus.value,
		},
	});

	//
	// D. Define context value

	const contextValue: RidesListContextState = useMemo(() => ({
		data: {
			filtered: ridesData ?? [],
			filteredByFavoriteIds: [],
		},
		flags: {
			error: ridesError,
			last_updated_at: ridesLastUpdatedAt,
			loading: ridesLoading,
		},
	}), [ridesData, ridesError, ridesLastUpdatedAt, ridesLoading]);

	//
	// E. Render components

	return (
		<RidesListContext.Provider value={contextValue}>
			{children}
		</RidesListContext.Provider>
	);
};
