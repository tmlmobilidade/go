/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useVehiclesListFilterSearch } from './use-vehicles-list-filter-search';

/* * */

export function VehiclesListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useVehiclesListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
