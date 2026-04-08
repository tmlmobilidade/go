/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterAgency() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.agency.isActive}
			label="Operador"
			onChange={alertsListContext.filters.agency.set}
			options={alertsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
