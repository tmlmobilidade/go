/* * */

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function PlansListFilterAgency() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={plansListContext.filters.agency.isActive}
			label="Operador"
			onChange={plansListContext.filters.agency.set}
			options={plansListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
