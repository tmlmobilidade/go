/* * */

import { usePlansListContext } from '@/contexts/PlansList.context';
import { planValidityStatus, planValidityStatusValues } from '@/types/normalized';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlansListFilterValidityStatus() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = planValidityStatusValues;
		const enabledValues = plansListContext.filters.validity_status;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [plansListContext.filters.validity_status, planValidityStatusValues]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!planValidityStatus?.length) return [];
		// Parse options to the expected format.
		return planValidityStatus.map(item => ({
			checked: plansListContext.filters.validity_status.includes(item.value),
			label: item.label,
			value: item.value,
		}));
	}, [plansListContext.filters.validity_status, planValidityStatus]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="Estado de Validade"
			onChange={plansListContext.actions.setFilterValidityStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
