'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterLifecycleStatus() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={stopsListContext.filters.lifecycle_status.isActive}
			label="Estado"
			onChange={stopsListContext.filters.lifecycle_status.set}
			options={stopsListContext.filters.lifecycle_status.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
