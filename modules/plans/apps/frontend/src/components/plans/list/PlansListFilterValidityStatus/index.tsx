/* * */

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansListFilterValidityStatus() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={plansListContext.filters.validity_status.isActive}
			label={t('plans:plans.list.PlansListFilterValidityStatus.label')}
			onChange={plansListContext.filters.validity_status.set}
			options={plansListContext.filters.validity_status.options}
			withToggleAll
		/>
	);

	//
}
