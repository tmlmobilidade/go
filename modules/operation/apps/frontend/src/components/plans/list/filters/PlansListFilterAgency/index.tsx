/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { usePlansListFilterAgency } from './use-plans-list-filter-agency';

/* * */

export function PlansListFilterAgency() {
	//

	//
	// A. Setup variables

	const filterAgency = usePlansListFilterAgency();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAgency.isActive}
			label="Operador"
			onChange={filterAgency.set}
			options={filterAgency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
