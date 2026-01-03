/* * */

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function PlansListFilterValidityStatus() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={plansListContext.filters.validity_status.isActive}
			label="Estado de Validade"
			onChange={plansListContext.filters.validity_status.set}
			options={plansListContext.filters.validity_status.options}
			withToggleAll
		/>
	);

	//
}
