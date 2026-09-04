/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useRidesListFilterSearch } from './use-rides-list-filter-search';

/* * */

export function RidesListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useRidesListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
