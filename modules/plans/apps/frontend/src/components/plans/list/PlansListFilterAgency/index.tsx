/* * */

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansListFilterAgency() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={plansListContext.filters.agency.isActive}
			label={t('plans:plans.list.PlansListFilterAgency.label')}
			onChange={plansListContext.filters.agency.set}
			options={plansListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
