/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterAgency } from './use-alerts-list-filter-agency';

/* * */

export function AlertsListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAgency = useAlertsListFilterAgency();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAgency.isActive}
			label={t('alerts:list.filters.agency.label')}
			onChange={filterAgency.set}
			options={filterAgency.options}
			isMultiple
			withToggleAll
		/>
	);
}
