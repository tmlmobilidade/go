'use client';

import { FilterTypeList, useAgenciesContext } from '@tmlmobilidade/ui';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';

/* * */

export function StopListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const stopsListContext = useStopsListContext();

	return (
		<FilterTypeList
			active={stopsListContext.filters.agencies.isActive}
			label="Operadores"
			onChange={stopsListContext.filters.agencies.set}
			options={stopsListContext.filters.agencies.options}
			isMultiple
			withToggleAll
		/>
	);
}
