/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function AlertsPublicListFilterEffect() {
	//

	//
	// A. Setup variables

	const alertsPublicListContext = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsPublicListContext.filters.effect.isActive}
			label="Efeito"
			onChange={alertsPublicListContext.filters.effect.set}
			options={alertsPublicListContext.filters.effect.options}
			withToggleAll
		/>
	);

	//
}
