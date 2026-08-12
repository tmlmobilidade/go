/* * */

import { RidesListFilterAcceptanceStatus } from '@/components/rides/list/RidesListFilterAcceptanceStatus';
import { RidesListFilterAgency } from '@/components/rides/list/RidesListFilterAgency';
import { RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '@/components/rides/list/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop';
import { RidesListFilterAnalysisExpectedApexValidationInterval } from '@/components/rides/list/RidesListFilterAnalysisExpectedApexValidationInterval';
import { RidesListFilterAnalysisSimpleThreeEvents } from '@/components/rides/list/RidesListFilterAnalysisSimpleThreeEvents';
import { RidesListFilterAnalysisTransactionSequentiality } from '@/components/rides/list/RidesListFilterAnalysisTransactionSequentiality';
import { RidesListFilterDateRange } from '@/components/rides/list/RidesListFilterDateRange';
import { RidesListFilterEndDelayStatus } from '@/components/rides/list/RidesListFilterEndDelayStatus';
import { RidesListFilterFavorites } from '@/components/rides/list/RidesListFilterFavorites';
import { RidesListFilterOperationalStatus } from '@/components/rides/list/RidesListFilterOperationalStatus';
import { RidesListFilterStartDelayStatus } from '@/components/rides/list/RidesListFilterStartDelayStatus';
import { RidesListFilterTicketingStatus } from '@/components/rides/list/RidesListFilterTicketingStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function RidesListFiltersBar() {
	return (
		<FiltersBar>
			<RidesListFilterFavorites />
			<RidesListFilterDateRange />
			<RidesListFilterAgency />
			<RidesListFilterOperationalStatus />
			<RidesListFilterStartDelayStatus />
			<RidesListFilterEndDelayStatus />
			<RidesListFilterAcceptanceStatus />
			<RidesListFilterAnalysisSimpleThreeEvents />
			<RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop />
			<RidesListFilterAnalysisExpectedApexValidationInterval />
			<RidesListFilterAnalysisTransactionSequentiality />
			<RidesListFilterTicketingStatus />
		</FiltersBar>
	);
}
