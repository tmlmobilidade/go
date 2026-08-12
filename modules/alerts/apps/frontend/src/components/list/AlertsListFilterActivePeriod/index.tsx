/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterActivePeriod() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={alertsListContext.filters.active_period.isActive}
			endDate={alertsListContext.filters.active_period.value_end}
			label="Data de Atividade"
			onEndDateChange={alertsListContext.filters.active_period.setEnd}
			onStartDateChange={alertsListContext.filters.active_period.setStart}
			startDate={alertsListContext.filters.active_period.value_start}
		/>
	);
}
