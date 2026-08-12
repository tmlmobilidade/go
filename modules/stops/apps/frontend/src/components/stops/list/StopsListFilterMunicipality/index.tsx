'use client';

import { FilterTypeList } from '@tmlmobilidade/ui';

import { useStopsListFilterMunicipality } from './use-stops-list-filter-municipality';

export function StopsListFilterMunicipality() {
//

	const filterMunicipality = useStopsListFilterMunicipality();

	return (
		<FilterTypeList
			active={filterMunicipality.isActive}
			label="Municípios"
			onChange={filterMunicipality.set}
			options={filterMunicipality.options}
			isMultiple
			withToggleAll

		/>
	);

//
}
