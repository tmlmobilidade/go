'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationRidesV1ExtractionCreate } from '@tmlmobilidade/go-types-extractions';
import { Button, fetchApiData, Pane, Section, useExtractionsListData, useHandleAction } from '@tmlmobilidade/ui';

import { useRidesListFilterAgency } from '../../list/filters/RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '../../list/filters/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterAnalysisExpectedApexValidationInterval } from '../../list/filters/RidesListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useRidesListFilterAnalysisSimpleThreeEvents } from '../../list/filters/RidesListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useRidesListFilterAnalysisTransactionSequentiality } from '../../list/filters/RidesListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useRidesListFilterDateRange } from '../../list/filters/RidesListFilterDateRange/use-rides-list-filter-date-range';
import { useRidesListFilterDriver } from '../../list/filters/RidesListFilterDriver/use-rides-list-filter-driver';
import { useRidesListFilterEndDelayStatus } from '../../list/filters/RidesListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useRidesListFilterOperationalStatus } from '../../list/filters/RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterSearch } from '../../list/filters/RidesListFilterSearch/use-rides-list-filter-search';
import { useRidesListFilterStartDelayStatus } from '../../list/filters/RidesListFilterStartDelayStatus/use-rides-list-filter-start-delay-status';
import { useRidesListFilterVehicle } from '../../list/filters/RidesListFilterVehicle/use-rides-list-filter-vehicle';
import { RidesExtractHeader } from '../RidesExtractHeader';

/* * */

export function RidesExtract() {
	//

	//
	// A. Setup variables

	const { mutate } = useExtractionsListData();

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

	//
	// B. Handle actions

	const { action: handleExtract } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], OperationRidesV1ExtractionCreate>({
			body: {
				properties: {
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
				},
				send_email_notification: false,
				version: 'operation-rides-v1',
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
		},
	});

	//
	// B. Render components

	return (
		<Pane header={[<RidesExtractHeader key="header" />]}>
			<Section>
				<Button label="Extract" onClick={handleExtract} />
			</Section>
		</Pane>
	);
}
