/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsPublicListFilterCause() {
	//

	//
	// A. Setup variables

	const alertsPublicListContext = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsPublicListContext.filters.cause.isActive}
			label="Causa"
			onChange={alertsPublicListContext.filters.cause.set}
			options={alertsPublicListContext.filters.cause.options}
			withToggleAll
		/>
	);

	//
}
