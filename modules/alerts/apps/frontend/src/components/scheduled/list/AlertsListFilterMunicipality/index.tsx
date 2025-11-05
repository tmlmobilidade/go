/* * */

import { useAlertListContext } from '@/contexts/AlertList.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertsListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertListContext();
	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = locationsContext.data.municipality_ids;
		const enabledValues = alertsListContext.filters.municipality;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [alertsListContext.filters.municipality, locationsContext.data.municipality_ids]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!locationsContext.data.municipalities?.length) return [];
		// Parse options to the expected format.
		return locationsContext.data.municipalities.map(item => ({
			checked: alertsListContext.filters.municipality.includes(item.id),
			label: item.name,
			value: item.id,
		}));
	}, [alertsListContext.filters.municipality, locationsContext.data.municipalities]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Município"
			onChange={alertsListContext.actions.setFilterMunicipality}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
