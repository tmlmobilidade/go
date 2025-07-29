/* * */

import { RidesListFilterAgency } from '@/components/list/RidesListFilterAgency';
import { RidesListFilterDateEnd } from '@/components/list/RidesListFilterDateEnd';
import { RidesListFilterDateStart } from '@/components/list/RidesListFilterDateStart';
import { RidesListFilterDelayStatus } from '@/components/list/RidesListFilterDelayStatus';
import { RidesListFilterOperationalStatus } from '@/components/list/RidesListFilterOperationalStatus';
import { RidesListFilterSimpleThreeEvents } from '@/components/list/RidesListFilterSimpleThreeEvents';
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
