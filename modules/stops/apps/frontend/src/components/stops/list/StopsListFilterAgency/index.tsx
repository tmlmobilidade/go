/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterAgency() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	if (stopsListContext.filters.agency.options.length <= 1) return null;

	return (
		<FilterTypeList
			active={stopsListContext.filters.agency.isActive}
			label="Operadores"
			onChange={stopsListContext.filters.agency.set}
			options={stopsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
