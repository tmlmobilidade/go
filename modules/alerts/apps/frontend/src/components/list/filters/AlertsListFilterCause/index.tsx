/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterCause } from './use-alerts-list-filter-cause';

/* * */

export function AlertsListFilterCause() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterCause = useAlertsListFilterCause();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterCause.isActive}
			label={t('alerts:list.filters.cause.label')}
			onChange={filterCause.set}
			options={filterCause.options}
			disabled
			withToggleAll
		/>
	);
}
