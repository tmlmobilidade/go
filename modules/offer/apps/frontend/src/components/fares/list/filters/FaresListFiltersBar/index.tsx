/* * */

import { FaresListFilterAgencies } from '@/components/fares/list/filters/FaresListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function FaresListFiltersBar() {
	return (
		<FiltersBar>
			<FaresListFilterAgencies />
		</FiltersBar>
	);
}
