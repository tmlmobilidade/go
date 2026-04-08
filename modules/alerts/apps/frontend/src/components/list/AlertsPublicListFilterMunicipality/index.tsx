/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsPublicListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const alertsPublicListContext = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsPublicListContext.filters.municipality.isActive}
			label="Município"
			onChange={alertsPublicListContext.filters.municipality.set}
			options={alertsPublicListContext.filters.municipality.options}
			withToggleAll
		/>
	);

	//
}
