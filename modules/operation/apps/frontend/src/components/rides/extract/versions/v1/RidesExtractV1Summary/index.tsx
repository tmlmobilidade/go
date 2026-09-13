'use client';

import { Section } from '@tmlmobilidade/ui';

import { useRidesListFilterAgency } from '../../../../list/filters/RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '../../../../list/filters/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterAnalysisExpectedApexValidationInterval } from '../../../../list/filters/RidesListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useRidesListFilterAnalysisSimpleThreeEvents } from '../../../../list/filters/RidesListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useRidesListFilterAnalysisTransactionSequentiality } from '../../../../list/filters/RidesListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useRidesListFilterDateRange } from '../../../../list/filters/RidesListFilterDateRange/use-rides-list-filter-date-range';
import { useRidesListFilterDriver } from '../../../../list/filters/RidesListFilterDriver/use-rides-list-filter-driver';
import { useRidesListFilterEndDelayStatus } from '../../../../list/filters/RidesListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useRidesListFilterOperationalStatus } from '../../../../list/filters/RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterSearch } from '../../../../list/filters/RidesListFilterSearch/use-rides-list-filter-search';
import { useRidesListFilterStartDelayStatus } from '../../../../list/filters/RidesListFilterStartDelayStatus/use-rides-list-filter-start-delay-status';
import { useRidesListFilterVehicle } from '../../../../list/filters/RidesListFilterVehicle/use-rides-list-filter-vehicle';

/* * */

export function RidesExtractV1Summary() {
	//

	//
	// A. Setup variables

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
	// C. Render components

	return (
		<Section>
			{/* TODO: Implement */}
		</Section>
	);
}
