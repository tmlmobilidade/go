/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useYearPeriodsListFilterSearch } from './use-year-periods-list-filter-search';

/* * */

export function YearPeriodsListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useYearPeriodsListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
