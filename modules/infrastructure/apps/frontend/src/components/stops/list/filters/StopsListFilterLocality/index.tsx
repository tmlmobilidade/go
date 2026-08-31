/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterLocality } from './use-stops-list-filter-locality';

/* * */

export function StopsListFilterLocality() {
	//

	const filterLocality = useStopsListFilterLocality();

	return (
		<ListFilter
			active={filterLocality.isActive}
			label="Localidade"
			onChange={filterLocality.set}
			options={filterLocality.options}
			isMultiple
			withToggleAll
		/>
	);
}
