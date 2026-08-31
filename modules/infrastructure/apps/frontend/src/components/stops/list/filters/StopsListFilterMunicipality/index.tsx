/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterMunicipality } from './use-stops-list-filter-municipality';

/* * */

export function StopsListFilterMunicipality() {
	//

	const filterMunicipality = useStopsListFilterMunicipality();

	return (
		<ListFilter
			active={filterMunicipality.isActive}
			label="Município"
			onChange={filterMunicipality.set}
			options={filterMunicipality.options}
			isMultiple
			withToggleAll
		/>
	);
}
