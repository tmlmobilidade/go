/* * */

import { useValidationsListContext } from '@/contexts/ValidationsList.context';
import { validationProcessingStatus } from '@/types/normalized';
import { PROCESSING_STATUS_OPTIONS } from '@tmlmobilidade/go-types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ValidationsListFilterProcessingStatus() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = PROCESSING_STATUS_OPTIONS;
		const enabledValues = validationsListContext.filters.processing_status;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [validationsListContext.filters.processing_status, PROCESSING_STATUS_OPTIONS]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!validationProcessingStatus?.length) return [];
		// Parse options to the expected format.
		return validationProcessingStatus.map(item => ({
			checked: validationsListContext.filters.processing_status.includes(item.value),
			label: item.label,
			value: item.value,
		}));
	}, [validationsListContext.filters.processing_status, validationProcessingStatus]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Estado"
			onChange={validationsListContext.actions.setFilterProcessingStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
