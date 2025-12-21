/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListFilterPublishStatus() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={scheduledListContext.filters.publish_status.isActive}
			label="Estado"
			onChange={scheduledListContext.filters.publish_status.set}
			options={scheduledListContext.filters.publish_status.options}
			withToggleAll
		/>
	);

	//
}
