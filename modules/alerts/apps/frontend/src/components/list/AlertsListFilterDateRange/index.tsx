/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterDateRange() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	const handleStartDateChange = (value: UnixTimestamp) => {
		alertsListContext.filters.active_period.set(value, null);
	};

	const handleEndDateChange = (value: UnixTimestamp) => {
		alertsListContext.filters.active_period.set(null, value);
	};

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={alertsListContext.filters.active_period.isActive}
			endDate={alertsListContext.filters.active_period.value_end as UnixTimestamp}
			label="Data de Atividade"
			onEndDateChange={handleEndDateChange}
			onStartDateChange={handleStartDateChange}
			startDate={alertsListContext.filters.active_period.value_start as UnixTimestamp}
		/>
	);

	//
}
