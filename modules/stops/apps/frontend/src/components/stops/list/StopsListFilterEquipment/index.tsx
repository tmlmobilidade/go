'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterEquipment() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={stopsListContext.filters.equipment.isActive}
			label="Equipamentos"
			onChange={stopsListContext.filters.equipment.set}
			options={stopsListContext.filters.equipment.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
