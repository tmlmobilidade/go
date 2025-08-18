/* * */

import { RidesListFilterAgency } from '@/components/rides/list/RidesListFilterAgency';
import { RidesListFilterDateEnd } from '@/components/rides/list/RidesListFilterDateEnd';
import { RidesListFilterDateStart } from '@/components/rides/list/RidesListFilterDateStart';
import { RidesListFilterDelayStatus } from '@/components/rides/list/RidesListFilterDelayStatus';
import { RidesListFilterOperationalStatus } from '@/components/rides/list/RidesListFilterOperationalStatus';
import { RidesListFilterSimpleThreeEvents } from '@/components/rides/list/RidesListFilterSimpleThreeEvents';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function RidesListFiltersBar() {
	return (
		<FiltersBar>
			<RidesListFilterAgency />
			<RidesListFilterOperationalStatus />
			<RidesListFilterDelayStatus />
			<RidesListFilterSimpleThreeEvents />
			<RidesListFilterDateStart />
			<RidesListFilterDateEnd />
		</FiltersBar>
	);
}
