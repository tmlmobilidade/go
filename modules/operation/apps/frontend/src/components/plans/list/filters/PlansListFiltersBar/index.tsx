/* * */

import { PlansListFilterAgency } from '@/components/plans/list/filters/PlansListFilterAgency';
import { PlansListFilterTemporalStatus } from '@/components/plans/list/filters/PlansListFilterTemporalStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function PlansListFiltersBar() {
	return (
		<FiltersBar>
			<PlansListFilterAgency />
			<PlansListFilterTemporalStatus />
		</FiltersBar>
	);
}
