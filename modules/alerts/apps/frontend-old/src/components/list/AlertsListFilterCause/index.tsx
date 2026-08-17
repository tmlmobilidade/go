/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterCause() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.cause.isActive}
			label="Causa"
			onChange={alertsListContext.filters.cause.set}
			options={alertsListContext.filters.cause.options}
			withToggleAll
		/>
	);

	//
}
