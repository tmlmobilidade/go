/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.agency.isActive}
			disabled={!alertsListContext.filters.agency.options.length}
			label={t('shared:home.alerts.public.list.filters.agency')}
			onChange={alertsListContext.filters.agency.set}
			options={alertsListContext.filters.agency.options}
			withToggleAll
		/>
	);

	//
}
