/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useOrganizationsListFilterSearch } from './use-organizations-list-filter-search';

/* * */

export function OrganizationsListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useOrganizationsListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
