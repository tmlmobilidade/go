/* * */

import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function ZonesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const zonesListContext = useZonesListContext();

	//
	// B. Render components

	return (
		<ListFilter
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
