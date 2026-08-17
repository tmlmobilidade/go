/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterPublishStatus() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.publish_status.isActive}
			label="Estado"
			onChange={alertsListContext.filters.publish_status.set}
			options={alertsListContext.filters.publish_status.options}
			withToggleAll
		/>
	);

	//
}
