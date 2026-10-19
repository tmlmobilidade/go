/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useRolesListFilterSearch } from './use-roles-list-filter-search';

/* * */

export function RolesListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useRolesListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
