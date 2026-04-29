'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterConnections() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={stopsListContext.filters.connections.isActive}
			label="Conexões"
			onChange={stopsListContext.filters.connections.set}
			options={stopsListContext.filters.connections.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
