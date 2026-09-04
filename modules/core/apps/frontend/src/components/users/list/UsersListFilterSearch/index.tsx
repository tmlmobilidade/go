/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useUsersListFilterSearch } from './use-users-list-filter-search';

/* * */

export function UsersListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useUsersListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
