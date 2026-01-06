/* * */

import { usePeriodsListContext } from '@/components/periods/list/PeriodsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PeriodsListFilterAgency() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();
	const { t } = useTranslation('dates');

	//
	// B. Render components

	return (
		<FilterTypeList
			active={periodsListContext.filters.agency.isActive}
			label={t('periods.list.FilterBar.agency.label')}
			onChange={periodsListContext.filters.agency.set}
			options={periodsListContext.filters.agency.options}
			withToggleAll
		/>
	);

	//
}
