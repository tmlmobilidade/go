/* * */

import { SearchField } from '@tmlmobilidade/ui';

import { useAlertsListFilterSearch } from './use-alerts-list-filter-search';

/* * */

export function AlertsListFilterSearch() {
	//

	//
	// A. Setup variables

	const filterSearch = useAlertsListFilterSearch();

	//
	// B. Render components

	return (
		<SearchField
			onChange={filterSearch.set}
			value={filterSearch.value}
		/>
	);
}
