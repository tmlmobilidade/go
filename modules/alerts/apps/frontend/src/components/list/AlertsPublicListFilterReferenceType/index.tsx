/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsPublicListFilterReferenceType() {
	//

	//
	// A. Setup variables

	const alertsPublicListContext = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsPublicListContext.filters.reference_type.isActive}
			label="Tipo de Referência"
			onChange={alertsPublicListContext.filters.reference_type.set}
			options={alertsPublicListContext.filters.reference_type.options}
			withToggleAll
		/>
	);

	//
}
