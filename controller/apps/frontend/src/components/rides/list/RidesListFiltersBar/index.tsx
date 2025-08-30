/* * */

import { RidesListFilterAgency } from '@/components/rides/list/RidesListFilterAgency';
import { RidesListFilterAnalysisEndedAtLastStop } from '@/components/rides/list/RidesListFilterAnalysisEndedAtLastStop';
import { RidesListFilterAnalysisExpectedApexValidationInterval } from '@/components/rides/list/RidesListFilterAnalysisExpectedApexValidationInterval';
import { RidesListFilterAnalysisSimpleThreeEvents } from '@/components/rides/list/RidesListFilterAnalysisSimpleThreeEvents';
import { RidesListFilterDateEnd } from '@/components/rides/list/RidesListFilterDateEnd';
import { RidesListFilterDateStart } from '@/components/rides/list/RidesListFilterDateStart';
import { RidesListFilterDelayStatus } from '@/components/rides/list/RidesListFilterDelayStatus';
import { RidesListFilterOperationalStatus } from '@/components/rides/list/RidesListFilterOperationalStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function RidesListFiltersBar() {
	return (
		<FiltersBar>
			<RidesListFilterAgency />
			<RidesListFilterOperationalStatus />
			<RidesListFilterDelayStatus />
			<RidesListFilterAnalysisSimpleThreeEvents />
			<RidesListFilterAnalysisEndedAtLastStop />
			<RidesListFilterAnalysisExpectedApexValidationInterval />
			<RidesListFilterDateStart />
			<RidesListFilterDateEnd />
		</FiltersBar>
	);
}
