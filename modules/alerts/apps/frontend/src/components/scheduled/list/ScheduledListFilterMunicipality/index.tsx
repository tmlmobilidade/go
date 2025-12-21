/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={scheduledListContext.filters.municipality.isActive}
			label="Município"
			onChange={scheduledListContext.filters.municipality.set}
			options={scheduledListContext.filters.municipality.options}
			withToggleAll
		/>
	);

	//
}
