/* * */

import { SamsFiltersAgency } from '@/components/sams/list/SamsFiltersAgency';
import { SamsFilterStatus } from '@/components/sams/list/SamsFilterStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function SamsFilters() {
	return (
		<FiltersBar>
			<SamsFilterStatus />
			<SamsFiltersAgency />
		</FiltersBar>
	);
}
