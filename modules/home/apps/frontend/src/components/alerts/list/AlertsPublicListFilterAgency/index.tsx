/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { filters } = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filters.agency.isActive}
			disabled={!filters.agency.options.length}
			label={t('shared:home.alerts.public.list.filters.agency')}
			onChange={filters.agency.set}
			options={filters.agency.options}
			withToggleAll
		/>
	);

	//
}
