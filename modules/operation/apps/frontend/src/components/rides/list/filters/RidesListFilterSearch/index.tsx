/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useRidesListFilterSearch } from './use-rides-list-filter-search';

/* * */

const RIDES_SEARCH_TAG_PREFIXES = ['v:', 'd:', 'l:'];

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
			tagPrefixes={RIDES_SEARCH_TAG_PREFIXES}
			value={filterSearch.value}
		/>
	);
}
