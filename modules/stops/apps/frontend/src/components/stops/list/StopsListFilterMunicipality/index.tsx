'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

export function StopsListFilterMunicipality() {
//

	const stopsListContext = useStopsListContext();

	return (
		<FilterTypeList
			active={stopsListContext.filters.municipality.isActive}
			label="Municípios"
			onChange={stopsListContext.filters.municipality.set}
			options={stopsListContext.filters.municipality.options}
			isMultiple
			withToggleAll

		/>
	);

//
}
