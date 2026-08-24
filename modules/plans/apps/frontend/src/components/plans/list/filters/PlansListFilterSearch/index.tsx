/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { usePlansListFilterSearch } from './use-plans-list-filter-search';

/* * */

export function PlansListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = usePlansListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);

	//
}
