'use client';

/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { SearchInput } from '@tmlmobilidade/ui';

/* * */

export function AlertsPublicListFilterSearch() {
	//

	//
	// A. Setup variables

	const alertsPublicListContext = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<SearchInput onChange={alertsPublicListContext.filters.search.set} value={alertsPublicListContext.filters.search.value} />
	);
}
