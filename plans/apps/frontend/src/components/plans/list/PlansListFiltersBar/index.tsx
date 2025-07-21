/* * */

import { PlansListFilterAgency } from '@/components/plans/list/PlansListFilterAgency';
import { PlansListFilterValidityStatus } from '@/components/plans/list/PlansListFilterValidityStatus';
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
