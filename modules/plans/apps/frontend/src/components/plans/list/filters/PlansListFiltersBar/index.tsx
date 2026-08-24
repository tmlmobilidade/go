/* * */

import { PlansListFilterAgency } from '@/components/plans/list/filters/PlansListFilterAgency';
import { PlansListFilterValidityStatus } from '@/components/plans/list/filters/PlansListFilterValidityStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function PlansListFiltersBar() {
	return (
		<FiltersBar>
			<PlansListFilterAgency />
			<PlansListFilterValidityStatus />
		</FiltersBar>
	);
}
