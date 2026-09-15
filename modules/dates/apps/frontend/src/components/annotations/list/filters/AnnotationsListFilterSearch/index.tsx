/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useAnnotationsListFilterSearch } from './use-annotations-list-filter-search';

/* * */

export function AnnotationsListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useAnnotationsListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
