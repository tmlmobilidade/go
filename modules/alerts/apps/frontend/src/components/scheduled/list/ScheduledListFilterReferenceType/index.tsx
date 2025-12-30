/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListFilterReferenceType() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={scheduledListContext.filters.reference_type.isActive}
			label="Tipo de Referência"
			onChange={scheduledListContext.filters.reference_type.set}
			options={scheduledListContext.filters.reference_type.options}
			withToggleAll
		/>
	);

	//
}
