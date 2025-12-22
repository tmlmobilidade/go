/* * */

import { useAnnotationsListContext } from '@/components/annotations/list/AnnotationsList.context';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AnnotationsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const annotationsListContext = useAnnotationsListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all agencies
		const defaultValues = agenciesContext.data.raw.map(item => item._id);
		const enabledValues = annotationsListContext.filters.agency;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [annotationsListContext.filters.agency, agenciesContext.data.raw]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!agenciesContext.data.raw?.length) return [];
		// Parse options to the expected format.
		return agenciesContext.data.raw.map(item => ({
			checked: annotationsListContext.filters.agency.includes(item._id),
			label: item.name,
			value: item._id,
		}));
	}, [annotationsListContext.filters.agency, agenciesContext.data.raw]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Operadores"
			onChange={annotationsListContext.actions.setFilterAgency}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
