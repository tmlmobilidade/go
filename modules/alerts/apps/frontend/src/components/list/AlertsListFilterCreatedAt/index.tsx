/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterCreatedAt() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={alertsListContext.filters.created_at.isActive}
			endDate={alertsListContext.filters.created_at.value_end}
			label="Data de Criação"
			onEndDateChange={alertsListContext.filters.created_at.setEnd}
			onStartDateChange={alertsListContext.filters.created_at.setStart}
			startDate={alertsListContext.filters.created_at.value_start}
		/>
	);
}
