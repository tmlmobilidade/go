/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeCreationDate } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterCreationDate() {
	//

	//

	const alertsListContext = useAlertsListContext();

	//

	const handleCreationDateChange = (value: UnixTimestamp) => {
		alertsListContext.actions.setFilterDateCreation(value);
	};
	const handleCreationDateLimitChange = (value: UnixTimestamp) => {
		alertsListContext.actions.setFilterDateCreationLimit(value);
	};

	//

	return (
		<FilterTypeCreationDate
			active={true}
			creationDate={alertsListContext.filters.date_creation as UnixTimestamp}
			creationDateLimit={alertsListContext.filters.date_creation_limit as UnixTimestamp}
			label="Data de Criação"
			onCreationDateChange={handleCreationDateChange}
			onCreationDateLimitChange={handleCreationDateLimitChange}
		/>
	);

	//
}
