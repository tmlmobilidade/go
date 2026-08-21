/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useSchoolsListFilterSearch } from './use-schools-list-filter-search';


/* * */

export function SchoolsListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useSchoolsListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
