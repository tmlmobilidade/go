/* * */

import { SamsFiltersAgency } from '@/components/sams/list/SamsFiltersAgency';
import { SamsFiltersDate } from '@/components/sams/list/SamsFiltersDate';
import { SamsFilterStatus } from '@/components/sams/list/SamsFilterStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function SamsFilters() {
	return (
		<FiltersBar>
			<SamsFilterStatus />
			<SamsFiltersDate />
			<SamsFiltersAgency />
		</FiltersBar>
	);
}
