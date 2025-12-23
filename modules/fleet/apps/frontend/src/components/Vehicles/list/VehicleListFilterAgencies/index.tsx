/* * */

import { useVehiclesListContext } from '@/components/Vehicles/list/VehiclesList.context';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function VehiclesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const vehiclesListContext = useVehiclesListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all agencies
		const defaultValues = agenciesContext.data.raw.map(item => item._id);
		const enabledValues = vehiclesListContext.filters.agency;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [vehiclesListContext.filters.agency, agenciesContext.data.raw]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!agenciesContext.data.raw?.length) return [];
		// Parse options to the expected format.
		return agenciesContext.data.raw.map(item => ({
			checked: vehiclesListContext.filters.agency.includes(item._id),
			label: item.name,
			value: item._id,
		}));
	}, [vehiclesListContext.filters.agency, agenciesContext.data.raw]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Operadores"
			onChange={vehiclesListContext.actions.setFilterAgency}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
