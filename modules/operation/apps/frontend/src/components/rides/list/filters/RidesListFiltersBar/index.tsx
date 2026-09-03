/* * */

import { RidesListFilterAcceptanceStatus } from '@/components/rides/list/filters/RidesListFilterAcceptanceStatus';
import { RidesListFilterAgency } from '@/components/rides/list/filters/RidesListFilterAgency';
import { RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '@/components/rides/list/filters/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop';
import { RidesListFilterAnalysisExpectedApexValidationInterval } from '@/components/rides/list/filters/RidesListFilterAnalysisExpectedApexValidationInterval';
import { RidesListFilterAnalysisSimpleThreeEvents } from '@/components/rides/list/filters/RidesListFilterAnalysisSimpleThreeEvents';
import { RidesListFilterAnalysisTransactionSequentiality } from '@/components/rides/list/filters/RidesListFilterAnalysisTransactionSequentiality';
import { RidesListFilterDateRange } from '@/components/rides/list/filters/RidesListFilterDateRange';
import { RidesListFilterDriver } from '@/components/rides/list/filters/RidesListFilterDriver';
import { RidesListFilterEndDelayStatus } from '@/components/rides/list/filters/RidesListFilterEndDelayStatus';
import { RidesListFilterFavorites } from '@/components/rides/list/filters/RidesListFilterFavorites';
import { RidesListFilterOperationalStatus } from '@/components/rides/list/filters/RidesListFilterOperationalStatus';
import { RidesListFilterStartDelayStatus } from '@/components/rides/list/filters/RidesListFilterStartDelayStatus';
import { RidesListFilterTicketingStatus } from '@/components/rides/list/filters/RidesListFilterTicketingStatus';
import { RidesListFilterVehicle } from '@/components/rides/list/filters/RidesListFilterVehicle';
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
			<RidesListFilterDriver />
			<RidesListFilterVehicle />
			<RidesListFilterTicketingStatus />
			<RidesListFilterAnalysisSimpleThreeEvents />
			<RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop />
			<RidesListFilterAnalysisExpectedApexValidationInterval />
			<RidesListFilterAnalysisTransactionSequentiality />
		</FiltersBar>
	);
}
