/* * */

import { SamsFiltersAgency } from '@/components/sams/list/SamsFilterAgency';
import { SamsFiltersApexVersion } from '@/components/sams/list/SamsFilterApexVersion';
import { SamsFiltersDate } from '@/components/sams/list/SamsFilterDate';
import { SamsFilterFavorites } from '@/components/sams/list/SamsFilterFavorites';
import { SamsFilterStatus } from '@/components/sams/list/SamsFilterStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function SamsFilters() {
	return (
		<FiltersBar>
			<SamsFilterFavorites />
			<SamsFiltersDate />
			<SamsFiltersAgency />
			<SamsFiltersApexVersion />
			<SamsFilterStatus />
		</FiltersBar>
	);
}
