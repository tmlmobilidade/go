/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { usePlansListFilterValidityStatus } from './use-plans-list-filter-validity-status';

/* * */

export function PlansListFilterValidityStatus() {
	//

	//
	// A. Setup variables

	const filterValidityStatus = usePlansListFilterValidityStatus();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterValidityStatus.isActive}
			label="Estado de Validade"
			onChange={filterValidityStatus.set}
			options={filterValidityStatus.options}
			withToggleAll
		/>
	);

	//
}
