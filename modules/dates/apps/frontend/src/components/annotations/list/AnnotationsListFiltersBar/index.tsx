/* * */

import { AnnotationsListFilterAgencies } from '@/components/annotations/list/AnnotationsListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

import { AnnotationsListFilterCategories } from '../filters/AnnotationsListFilterCategories';
import { AnnotationsListFilterDates } from '../filters/AnnotationsListFilterDates';
import { AnnotationsListFilterLocations } from '../filters/AnnotationsListFilterLocations';

/* * */

export function AnnotationsListFiltersBar() {
	return (
		<FiltersBar>
			<AnnotationsListFilterLocations />
			<AnnotationsListFilterDates />
			<AnnotationsListFilterCategories />
			<AnnotationsListFilterAgencies />
		</FiltersBar>
	);
}
