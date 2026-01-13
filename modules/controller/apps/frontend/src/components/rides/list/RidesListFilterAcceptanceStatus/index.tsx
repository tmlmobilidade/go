/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { RideAcceptanceStatusSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAcceptanceStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = [...RideAcceptanceStatusSchema.options, 'none'];
		const enabledValues = ridesListContext.filters.acceptance_status;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [ridesListContext.filters.acceptance_status]);

	const parsedOptions = useMemo(() => {
		// Parse options to the expected format.
		return [...RideAcceptanceStatusSchema.options, 'none'].map(value => ({
			checked: ridesListContext.filters.acceptance_status.includes(value),
			label: value,
			value: value,
		}));
	}, [ridesListContext.filters.acceptance_status]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('controller:rides.list.RidesListFilterAcceptanceStatus.acceptance_status.label')}
			onChange={ridesListContext.actions.setFilterAcceptanceStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
