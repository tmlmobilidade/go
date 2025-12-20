/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { AlertSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ScheduledListFilterCause() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = Array.from(AlertSchema.shape.cause.options) as string[];
		const enabledValues = scheduledListContext.filters.cause;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [scheduledListContext.filters.cause]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!AlertSchema.shape.cause.options?.length) return [];
		// Parse options to the expected format.
		return AlertSchema.shape.cause.options.map(item => ({
			checked: scheduledListContext.filters.cause.includes(item),
			label: item,
			value: item,
		}));
	}, [scheduledListContext.filters.cause]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Causa"
			onChange={scheduledListContext.actions.setFilterCause}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
