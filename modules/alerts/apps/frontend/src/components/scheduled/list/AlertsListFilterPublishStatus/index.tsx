/* * */

import { useAlertListContext } from '@/contexts/AlertList.context';
import { AlertSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertsListFilterPublishStatus() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = Array.from(AlertSchema.shape.publish_status.options) as string[];
		const enabledValues = alertsListContext.filters.publish_status;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [alertsListContext.filters.publish_status]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!AlertSchema.shape.publish_status.options?.length) return [];
		// Parse options to the expected format.
		return AlertSchema.shape.publish_status.options.map(item => ({
			checked: alertsListContext.filters.publish_status.includes(item),
			label: item,
			value: item,
		}));
	}, [alertsListContext.filters.publish_status]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Estado"
			onChange={alertsListContext.actions.setFilterPublishStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
