/* * */

import { useAlertListContext } from '@/contexts/AlertList.context';
import { AlertSchema } from '@tmlmobilidade/go-types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertsListFilterEffect() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = Array.from(AlertSchema.shape.effect.options) as string[];
		const enabledValues = alertsListContext.filters.effect;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [alertsListContext.filters.effect]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!AlertSchema.shape.effect.options?.length) return [];
		// Parse options to the expected format.
		return AlertSchema.shape.effect.options.map(item => ({
			checked: alertsListContext.filters.effect.includes(item),
			label: item,
			value: item,
		}));
	}, [alertsListContext.filters.effect]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Efeito"
			onChange={alertsListContext.actions.setFilterEffect}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
