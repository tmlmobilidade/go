/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterDistrict } from './use-stops-list-filter-district';

/* * */

export function StopsListFilterDistrict() {
	//

	const filterDistrict = useStopsListFilterDistrict();

	return (
		<ListFilter
			active={filterDistrict.isActive}
			label="Distrito"
			onChange={filterDistrict.set}
			options={filterDistrict.options}
			isMultiple
			withToggleAll
		/>
	);
}
