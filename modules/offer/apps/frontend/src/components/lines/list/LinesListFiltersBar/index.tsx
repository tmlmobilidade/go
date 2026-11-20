/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

import { LinesListFilterOrganizations } from '../filters/LinesListFilterOrganizations';
import { LinesListFilterAgencies } from '../LinesListFilterAgencies';

/* * */

export function LinesListFiltersBar() {
	return (
		<FiltersBar>
			<LinesListFilterAgencies />
			<LinesListFilterOrganizations />
		</FiltersBar>
	);
}
