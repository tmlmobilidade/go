/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.municipality.isActive}
			label="Município"
			onChange={alertsListContext.filters.municipality.set}
			options={alertsListContext.filters.municipality.options}
			withToggleAll
		/>
	);

	//
}
