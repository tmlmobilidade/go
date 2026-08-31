/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterAgency } from './use-stops-list-filter-agency';

/* * */

export function StopsListFilterAgency() {
	//

	//
	// A. Setup variables

	const filterAgency = useStopsListFilterAgency();

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
