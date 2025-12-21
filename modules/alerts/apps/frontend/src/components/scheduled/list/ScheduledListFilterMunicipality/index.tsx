/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { FilterTypeList, useLocationsContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ScheduledListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();
	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = locationsContext.data.municipality_ids;
		const enabledValues = scheduledListContext.filters.municipality;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [scheduledListContext.filters.municipality, locationsContext.data.municipality_ids]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!locationsContext.data.municipalities?.length) return [];
		// Parse options to the expected format.
		return locationsContext.data.municipalities.map(item => ({
			checked: scheduledListContext.filters.municipality.includes(item.id),
			label: item.name,
			value: item.id,
		}));
	}, [scheduledListContext.filters.municipality, locationsContext.data.municipalities]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Município"
			onChange={scheduledListContext.actions.setFilterMunicipality}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
