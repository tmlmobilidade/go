/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterParish } from './use-stops-list-filter-parish';

/* * */

export function StopsListFilterParish() {
	//

	const filterParish = useStopsListFilterParish();

	return (
		<ListFilter
			active={filterParish.isActive}
			label="Freguesia"
			onChange={filterParish.set}
			options={filterParish.options}
			isMultiple
			withToggleAll
		/>
	);
}
