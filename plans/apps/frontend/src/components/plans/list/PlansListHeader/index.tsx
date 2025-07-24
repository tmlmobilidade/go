/* * */

import { usePlansListContext } from '@/contexts/PlansList.context';
import { Label, SearchInput, Spacer } from '@tmlmobilidade/ui';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps singleLine>Planos</Label>
			<Spacer />
			<SearchInput onChange={plansListContext.actions.setFilterSearch} value={plansListContext.filters.search} />
		</>
	);

	//
}
