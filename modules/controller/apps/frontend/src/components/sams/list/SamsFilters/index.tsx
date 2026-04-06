/* * */

import { SamsFiltersAgency } from '@/components/sams/list/SamsFiltersAgency';
import { SamsFiltersApexVersion } from '@/components/sams/list/SamsFiltersApexVersion';
import { SamsFiltersDate } from '@/components/sams/list/SamsFiltersDate';
import { SamsFilterStatus } from '@/components/sams/list/SamsFilterStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function SamsFilters() {
	return (
		<FiltersBar>
			<SamsFiltersDate />
			<SamsFiltersAgency />
			<SamsFiltersApexVersion />
			<SamsFilterStatus />
		</FiltersBar>
	);
}
