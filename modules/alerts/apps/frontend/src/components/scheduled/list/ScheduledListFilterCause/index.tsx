/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListFilterCause() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={scheduledListContext.filters.cause.isActive}
			label="Causa"
			onChange={scheduledListContext.filters.cause.set}
			options={scheduledListContext.filters.cause.options}
			withToggleAll
		/>
	);

	//
}
