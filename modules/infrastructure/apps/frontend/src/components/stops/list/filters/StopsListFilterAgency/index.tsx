/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterAgency } from './use-stops-list-filter-agency';

/* * */

export function StopsListFilterAgency() {
	//

	const filterAgency = useStopsListFilterAgency();

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
}
