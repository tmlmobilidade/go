/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterAcceptanceStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.acceptance_status.isActive}
			label="Aceitação"
			onChange={ridesListContext.filters.acceptance_status.set}
			options={ridesListContext.filters.acceptance_status.options}
			withToggleAll
		/>
	);

	//
}
