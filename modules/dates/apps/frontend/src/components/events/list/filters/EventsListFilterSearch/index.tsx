/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useEventsListFilterSearch } from './use-events-list-filter-search';

/* * */

export function EventsListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useEventsListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
