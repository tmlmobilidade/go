/* * */

import { HolidaysListFilterAgencies } from '@/components/holidays/list/HolidaysListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function HolidaysListFiltersBar() {
	return (
		<FiltersBar>
			<HolidaysListFilterAgencies />
		</FiltersBar>
	);
}
