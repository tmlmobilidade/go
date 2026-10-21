/* * */

import { ZonesListFilterAgencies } from '@/components/zones/list/filters/ZonesListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function ZonesListFiltersBar() {
	return (
		<FiltersBar>
			<ZonesListFilterAgencies />
		</FiltersBar>
	);
}
