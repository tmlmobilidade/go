/* * */

import { RidesListFilterAcceptanceStatus } from '@/components/rides/list/RidesListFilterAcceptanceStatus';
import { RidesListFilterAgency } from '@/components/rides/list/RidesListFilterAgency';
import { RidesListFilterAnalysisEndedAtLastStop } from '@/components/rides/list/RidesListFilterAnalysisEndedAtLastStop';
import { RidesListFilterAnalysisExpectedApexValidationInterval } from '@/components/rides/list/RidesListFilterAnalysisExpectedApexValidationInterval';
import { RidesListFilterAnalysisSimpleThreeEvents } from '@/components/rides/list/RidesListFilterAnalysisSimpleThreeEvents';
import { RidesListFilterAnalysisTransactionSequentiality } from '@/components/rides/list/RidesListFilterAnalysisTransactionSequentiality';
import { RidesListFilterDateRange } from '@/components/rides/list/RidesListFilterDateRange';
import { RidesListFilterDelayStatus } from '@/components/rides/list/RidesListFilterDelayStatus';
import { RidesListFilterOperationalStatus } from '@/components/rides/list/RidesListFilterOperationalStatus';
import { RidesListFilterPins } from '@/components/rides/list/RidesListFilterPins';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function RidesListFiltersBar() {
	return (
		<FiltersBar>
			<RidesListFilterPins />
			<RidesListFilterDateRange />
			<RidesListFilterAgency />
			<RidesListFilterOperationalStatus />
			<RidesListFilterDelayStatus />
			<RidesListFilterAcceptanceStatus />
			<RidesListFilterAnalysisSimpleThreeEvents />
			<RidesListFilterAnalysisEndedAtLastStop />
			<RidesListFilterAnalysisExpectedApexValidationInterval />
			<RidesListFilterAnalysisTransactionSequentiality />
		</FiltersBar>
	);
}
