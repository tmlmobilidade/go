'use client';

/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

import { SamsDetailListFilterApexVersion } from '../SamDetailListFilterApexVersion';
import { SamsDetailListFilterDate } from '../SamDetailListFilterDate';

/* * */

export function SamsDetailListFilters() {
	return (
		<FiltersBar>
			<SamsDetailListFilterDate />
			<SamsDetailListFilterApexVersion />
		</FiltersBar>
	);
}
