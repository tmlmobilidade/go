/* * */

import { PlansListFilterAgency } from '@/components/plans/list/PlansListFilterAgency';
import { PlansListFilterValidityStatus } from '@/components/plans/list/PlansListFilterValidityStatus';
import { FiltersBar } from '@go/ui';

/* * */

export function PlansListFiltersBar() {
	return (
		<FiltersBar>
			<PlansListFilterAgency />
			<PlansListFilterValidityStatus />
		</FiltersBar>
	);
}
