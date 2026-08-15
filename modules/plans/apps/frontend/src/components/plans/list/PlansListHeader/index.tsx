/* * */

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { Label, SearchField, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Planos</Label>
			<Spacer />
			<SearchField onChange={plansListContext.filters.search.set} value={plansListContext.filters.search.value} />
		</Toolbar>
	);

	//
}
