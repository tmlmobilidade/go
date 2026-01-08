/* * */

import { ZonesListFilterAgencies } from '@/components/zones/list/ZonesListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function ZonesListFiltersBar() {
	return (
		<FiltersBar>
			<ZonesListFilterAgencies />
		</FiltersBar>
	);
}
