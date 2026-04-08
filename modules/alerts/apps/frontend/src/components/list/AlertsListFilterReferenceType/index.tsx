/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterReferenceType() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.reference_type.isActive}
			label="Tipo de Referência"
			onChange={alertsListContext.filters.reference_type.set}
			options={alertsListContext.filters.reference_type.options}
			withToggleAll
		/>
	);

	//
}
