/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeCreationDate } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterCreationDate() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	const handleCreationDateStartChange = (value: UnixTimestamp) => {
		alertsListContext.filters.date_creation_start.set(value);
	};
	const handleCreationDateEndChange = (value: UnixTimestamp) => {
		alertsListContext.filters.date_creation_end.set(value);
	};

	//
	// B. Render components

	return (
		<FilterTypeCreationDate
			active={true}
			creationDateEnd={alertsListContext.filters.date_creation_end.value as UnixTimestamp}
			creationDateStart={alertsListContext.filters.date_creation_start.value as UnixTimestamp}
			label="Data de Criação"
			onCreationDateChange={handleCreationDateStartChange}
			onCreationDateLimitChange={handleCreationDateEndChange}
		/>
	);

	//
}
