/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { usePlansListFilterTemporalStatus } from './use-plans-list-filter-temporal-status';

/* * */

export function PlansListFilterTemporalStatus() {
	//

	//
	// A. Setup variables

	const filterTemporalStatus = usePlansListFilterTemporalStatus();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterTemporalStatus.isActive}
			label="Estado"
			onChange={filterTemporalStatus.set}
			options={filterTemporalStatus.options}
			withToggleAll
		/>
	);
}
