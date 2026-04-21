'use client';

/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { SearchInput } from '@tmlmobilidade/ui';

/* * */

export function AlertsPublicListFilterSearch() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<SearchInput onChange={alertsListContext.filters.search.set} value={alertsListContext.filters.search.value} />
	);
}
