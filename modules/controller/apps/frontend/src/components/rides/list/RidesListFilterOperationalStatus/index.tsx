/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterOperationalStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.operational_status.isActive}
			label="Estado"
			onChange={ridesListContext.filters.operational_status.set}
			options={ridesListContext.filters.operational_status.options}
			withToggleAll
		/>
	);

	//
}
