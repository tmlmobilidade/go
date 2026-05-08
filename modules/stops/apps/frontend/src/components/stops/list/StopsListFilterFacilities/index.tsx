'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterFacilities() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={stopsListContext.filters.facilities.isActive}
			label="Serviços"
			onChange={stopsListContext.filters.facilities.set}
			options={stopsListContext.filters.facilities.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
