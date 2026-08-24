/* * */

import { PlansListFilterSearch } from '@/components/plans/list/filters/PlansListFilterSearch';
import { Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Planos</Label>
			<Spacer />
			<PlansListFilterSearch />
		</Toolbar>
	);

	//
}
