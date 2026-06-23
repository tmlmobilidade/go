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
		alertsListContext.filters.created_at.set(value, null);
	};
	const handleCreationDateEndChange = (value: UnixTimestamp) => {
		alertsListContext.filters.created_at.set(null, value);
	};

	//
	// B. Render components

	return (
		<FilterTypeCreationDate
			active={alertsListContext.filters.created_at.isActive}
			creationDateEnd={alertsListContext.filters.created_at.value_end as UnixTimestamp}
			creationDateStart={alertsListContext.filters.created_at.value_start as UnixTimestamp}
			label="Data de Criação"
			onCreationDateChange={handleCreationDateStartChange}
			onCreationDateLimitChange={handleCreationDateEndChange}
		/>
	);

	//
}
