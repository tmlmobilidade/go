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

	const handleCreationDateChange = (value: UnixTimestamp) => {
		alertsListContext.actions.setFilterDateCreation(value);
	};

	//

	return (
		<FilterTypeDateRange
			active={true}
			creationDate={alertsListContext.filters.date_creation as UnixTimestamp}
			endDate={alertsListContext.filters.date_end as UnixTimestamp}
			label="Datas"
			onCreationDateChange={handleCreationDateChange}
			onEndDateChange={handleEndDateChange}
			onStartDateChange={handleStartDateChange}
			startDate={alertsListContext.filters.date_start as UnixTimestamp}
			thirdOption={true}
		/>
	);

	//
}
