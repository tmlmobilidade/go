/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

import { SchoolsListFilterCycle } from '../SchoolsListFilterCycle';
import { SchoolsListFilterGrouping } from '../SchoolsListFilterGrouping';
import { SchoolsListFilterMunicipality } from '../SchoolsListFilterMunicipality';

/* * */

export function SchoolsListFiltersBar() {
	return (
		<FiltersBar>
			<SchoolsListFilterMunicipality />
			<SchoolsListFilterCycle />
			<SchoolsListFilterGrouping />
		</FiltersBar>
	);
}
