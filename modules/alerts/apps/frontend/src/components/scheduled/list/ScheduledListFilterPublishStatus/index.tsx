/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { PublishStatusSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ScheduledListFilterPublishStatus() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = Array.from(PublishStatusSchema.options) as string[];
		const enabledValues = scheduledListContext.filters.publish_status;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [scheduledListContext.filters.publish_status]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!PublishStatusSchema.options?.length) return [];
		// Parse options to the expected format.
		return PublishStatusSchema.options.map(item => ({
			checked: scheduledListContext.filters.publish_status.includes(item),
			label: item,
			value: item,
		}));
	}, [scheduledListContext.filters.publish_status]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Estado"
			onChange={scheduledListContext.actions.setFilterPublishStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
