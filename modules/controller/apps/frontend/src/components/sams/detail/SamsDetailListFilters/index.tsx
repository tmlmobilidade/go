'use client';

/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

import { SamsDetailListFilterApexVersion } from '../SamsDetailListFilterApexVersion';
import { SamsDetailListFilterDate } from '../SamsDetailListFilterDate';

/* * */

export function SamsDetailListFilters() {
	return (
		<FiltersBar>
			<SamsDetailListFilterDate />
			<SamsDetailListFilterApexVersion />
		</FiltersBar>
	);
}
