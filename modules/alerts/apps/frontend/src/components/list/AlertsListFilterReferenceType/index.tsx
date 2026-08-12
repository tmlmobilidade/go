/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterReferenceType() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={alertsListContext.filters.reference_type.isActive}
			label="Tipo de Referência"
			onChange={alertsListContext.filters.reference_type.set}
			options={alertsListContext.filters.reference_type.options}
			withToggleAll
		/>
	);

	//
}
