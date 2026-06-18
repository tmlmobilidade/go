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
		alertsListContext.filters.date_start.set(value);
	};

	const handleEndDateChange = (value: UnixTimestamp) => {
		alertsListContext.filters.date_end.set(value);
	};

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={true}
			endDate={alertsListContext.filters.date_end.value as UnixTimestamp}
			label="Datas"
			onEndDateChange={handleEndDateChange}
			onStartDateChange={handleStartDateChange}
			startDate={alertsListContext.filters.date_start.value as UnixTimestamp}
		/>
	);

	//
}
