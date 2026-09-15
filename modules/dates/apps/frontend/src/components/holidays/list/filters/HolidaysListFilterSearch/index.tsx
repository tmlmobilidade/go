/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useHolidaysListFilterSearch } from './use-holidays-list-filter-search';

/* * */

export function HolidaysListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useHolidaysListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
