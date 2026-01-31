/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterDelayStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.delay_status.isActive}
			label="Atraso"
			onChange={ridesListContext.filters.delay_status.set}
			options={ridesListContext.filters.delay_status.options}
			withToggleAll
		/>
	);

	//
}
