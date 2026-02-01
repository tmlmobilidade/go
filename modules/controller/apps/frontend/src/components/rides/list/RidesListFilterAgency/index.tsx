/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterAgency() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.agency.isActive}
			label="Operador"
			onChange={ridesListContext.filters.agency.set}
			options={ridesListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
