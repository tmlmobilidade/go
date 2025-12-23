/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansListFilterAgency() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const plansListContext = usePlansListContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.list.filterBar' });

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = agenciesContext.data.raw.map(item => item._id);
		const enabledValues = plansListContext.filters.agency;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [plansListContext.filters.agency, agenciesContext.data.raw]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!agenciesContext.data.raw?.length) return [];
		// Parse options to the expected format.
		return agenciesContext.data.raw.map(item => ({
			checked: plansListContext.filters.agency.includes(item._id),
			label: item.name,
			value: item._id,
		}));
	}, [plansListContext.filters.agency, agenciesContext.data.raw]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('filter_agency.label')}
			onChange={plansListContext.actions.setFilterAgency}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
