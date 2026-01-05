/* * */

import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ZonesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const zonesListContext = useZonesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={zonesListContext.filters.agencies.isActive}
			label="Operadores"
			onChange={zonesListContext.filters.agencies.set}
			options={zonesListContext.filters.agencies.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
