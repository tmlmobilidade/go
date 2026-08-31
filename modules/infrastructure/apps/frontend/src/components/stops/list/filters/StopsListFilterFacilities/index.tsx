/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterFacilities } from './use-stops-list-filter-facilities';

/* * */

export function StopsListFilterFacilities() {
	//

	//
	// A. Setup variables

	const filterFacilities = useStopsListFilterFacilities();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterFacilities.isActive}
			label="Serviços"
			onChange={filterFacilities.set}
			options={filterFacilities.options}
			withToggleAll
		/>
	);
}
