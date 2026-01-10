/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFilterEffect() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.effect.isActive}
			label="Efeito"
			onChange={alertsListContext.filters.effect.set}
			options={alertsListContext.filters.effect.options}
			withToggleAll
		/>
	);

	//
}
