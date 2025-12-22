/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListFilterAgency() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={scheduledListContext.filters.agency.isActive}
			label="Operador"
			onChange={scheduledListContext.filters.agency.set}
			options={scheduledListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
