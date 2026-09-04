/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useAgenciesListFilterSearch } from './use-agencies-list-filter-search';

/* * */

export function AgenciesListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useAgenciesListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
