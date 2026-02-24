/* * */

import { TypologiesListFilterAgencies } from '@/components/typologies/list/TypologiesListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function TypologiesListFiltersBar() {
	return (
		<FiltersBar>
			<TypologiesListFilterAgencies />
		</FiltersBar>
	);
}
