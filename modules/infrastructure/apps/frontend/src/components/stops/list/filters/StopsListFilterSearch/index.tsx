/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useStopsListFilterSearch } from './use-stops-list-filter-search';

/* * */

export function StopsListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useStopsListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
