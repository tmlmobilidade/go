/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterDateRange() {
	//

	//

	const alertsListContext = useAlertsListContext();

	//

	const handleStartDateChange = (value: UnixTimestamp) => {
		alertsListContext.actions.setFilterDateStart(value);
	};

	const handleEndDateChange = (value: UnixTimestamp) => {
		alertsListContext.actions.setFilterDateEnd(value);
	};

	//

	return (
		<FilterTypeDateRange
			active={true}
			endDate={alertsListContext.filters.date_end as UnixTimestamp}
			label="Datas"
			onEndDateChange={handleEndDateChange}
			onStartDateChange={handleStartDateChange}
			startDate={alertsListContext.filters.date_start as UnixTimestamp}
		/>
	);

	//
}
