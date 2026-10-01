'use client';

/* * */

import { SamsDetailListFilterApexVersion } from '@/components/sams/detail/SamDetailListFilters/SamListFilterApex';
import { SamsDetailListFilterDate } from '@/components/sams/detail/SamDetailListFilters/SamListFilterDate';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function SamsDetailListFilters() {
	return (
		<FiltersBar>
			<SamsDetailListFilterDate />
			<SamsDetailListFilterApexVersion />
		</FiltersBar>
	);
}
