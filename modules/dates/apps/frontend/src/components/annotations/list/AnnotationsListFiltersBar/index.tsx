/* * */

import { AnnotationsListFilterAgencies } from '@/components/annotations/list/AnnotationsListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function AnnotationsListFiltersBar() {
	return (
		<FiltersBar>
			<AnnotationsListFilterAgencies />
		</FiltersBar>
	);
}
