/* * */

import { PeriodsListFilterAgency } from '@/components/year-periods/list/PeriodsListFilterAgency';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function PeriodsListFiltersBar() {
	return (
		<FiltersBar>
			<PeriodsListFilterAgency />
		</FiltersBar>
	);
}
